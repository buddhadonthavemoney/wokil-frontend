#!/usr/bin/env python3
"""Shared helper for the Jira PR/deploy sync GitHub Actions workflows.

Reads free text (a PR title, or a block of commit messages) from stdin,
extracts SCRUM-### ticket keys, and transitions each one to a given status.

Usage:
    echo "$PR_TITLE" | python jira.py transition "In Review"
    git log <range> --format=%B | python jira.py transition "Deployed"
    echo "$PR_TITLE" | python jira.py extract-keys

`transition` reads JIRA_BASE_URL, JIRA_USER_EMAIL, and JIRA_API_TOKEN from
the environment.
"""
import argparse
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


def basic_auth_header(email: str, api_token: str) -> str:
    token = base64.b64encode(f"{email}:{api_token}".encode()).decode()
    return f"Basic {token}"


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


def cmd_extract_keys(_args: argparse.Namespace) -> None:
    for key in extract_ticket_keys(sys.stdin.read()):
        print(key)


def cmd_transition(args: argparse.Namespace) -> None:
    base_url = os.environ["JIRA_BASE_URL"]
    auth_header = basic_auth_header(os.environ["JIRA_USER_EMAIL"], os.environ["JIRA_API_TOKEN"])

    keys = extract_ticket_keys(sys.stdin.read())
    if not keys:
        print("No SCRUM-### keys found in input, nothing to sync.")
        return

    failed = False
    for key in keys:
        try:
            transition_issue_by_name(base_url, auth_header, key, args.status)
        except Exception as e:  # noqa: BLE001 - report and continue with the rest
            print(f'::warning::Failed to transition {key} to "{args.status}": {e}')
            failed = True

    if failed:
        sys.exit(1)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True)

    p_extract = sub.add_parser("extract-keys", help="Print SCRUM-### keys found in stdin, one per line")
    p_extract.set_defaults(func=cmd_extract_keys)

    p_transition = sub.add_parser("transition", help="Transition every SCRUM-### key found in stdin to the given status")
    p_transition.add_argument("status", help='Target Jira status name, e.g. "In Review"')
    p_transition.set_defaults(func=cmd_transition)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
