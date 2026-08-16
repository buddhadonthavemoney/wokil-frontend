#!/usr/bin/env python3
"""Shared helper for the Jira PR/deploy sync GitHub Actions workflows.

Reads free text (a PR title, or a block of commit messages) from stdin,
extracts SCRUM-### ticket keys, and transitions each one to the status given
as the sole argument. Reads JIRA_BASE_URL, JIRA_USER_EMAIL, and JIRA_API_TOKEN
from the environment.

Usage:
    echo "$PR_TITLE" | python jira.py "In Review"
    git log <range> --format=%B | python jira.py "Deployed"
"""
import base64
import json
import os
import re
import sys
import urllib.error
import urllib.request

TICKET_KEY_RE = re.compile(r"\bSCRUM-\d+\b", re.IGNORECASE)


def extract_ticket_keys(text: str) -> list[str]:
    """Unique SCRUM-### keys found in text, normalized to uppercase, in
    first-seen order."""
    seen: list[str] = []
    for match in TICKET_KEY_RE.findall(text):
        key = match.upper()
        if key not in seen:
            seen.append(key)
    return seen


def _request(url: str, auth_header: str, method: str = "GET", body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", auth_header)
    req.add_header("Accept", "application/json")
    if data is not None:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, resp.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()


def transition_issue_by_name(base_url: str, auth_header: str, issue_key: str, target_status_name: str) -> None:
    """Transitions issue_key to target_status_name (case-insensitive match
    against its currently available transitions). No-ops (with a log line,
    not an error) if the issue doesn't exist, or has no transition to that
    status right now — e.g. it's already past it. Raises only on unexpected
    API failures."""
    transitions_url = f"{base_url}/rest/api/3/issue/{issue_key}/transitions"

    status, body = _request(transitions_url, auth_header)
    if status == 404:
        print(f"[jira] {issue_key} not found, skipping")
        return
    if status != 200:
        raise RuntimeError(f"failed to list transitions for {issue_key}: {status} {body}")

    transitions = json.loads(body)["transitions"]
    match = next(
        (t for t in transitions if t["name"].lower() == target_status_name.lower()),
        None,
    )
    if match is None:
        print(
            f'[jira] {issue_key} has no "{target_status_name}" transition available '
            "right now (maybe already past it) — skipping"
        )
        return

    status, body = _request(
        transitions_url,
        auth_header,
        method="POST",
        body={"transition": {"id": match["id"]}},
    )
    if status not in (200, 204):
        raise RuntimeError(f'failed to transition {issue_key} to "{target_status_name}": {status} {body}')

    print(f"[jira] {issue_key} -> {target_status_name}")


def main() -> None:
    status_name = sys.argv[1]
    base_url = os.environ["JIRA_BASE_URL"]
    token = base64.b64encode(
        f'{os.environ["JIRA_USER_EMAIL"]}:{os.environ["JIRA_API_TOKEN"]}'.encode()
    ).decode()
    auth_header = f"Basic {token}"

    keys = extract_ticket_keys(sys.stdin.read())
    if not keys:
        print("No SCRUM-### keys found in input, nothing to sync.")
        return

    failed = False
    for key in keys:
        try:
            transition_issue_by_name(base_url, auth_header, key, status_name)
        except Exception as e:  # noqa: BLE001 - report and continue with the rest
            print(f'::warning::Failed to transition {key} to "{status_name}": {e}')
            failed = True

    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
