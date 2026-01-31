import { LawyerProfile } from '../types/lawyer';

export const generateStandaloneHTML = (profile: LawyerProfile, childHtml: string): string => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${profile.fullName} | ${profile.professionalTitle}</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Tailwind CSS with Plugins -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        border: "hsl(214 32% 91%)",
                        input: "hsl(214 32% 91%)",
                        ring: "hsl(222 47% 11%)",
                        background: "hsl(210 20% 98%)",
                        foreground: "hsl(222 47% 11%)",
                        primary: {
                            DEFAULT: "hsl(222 47% 11%)",
                            foreground: "hsl(210 40% 98%)",
                        },
                        secondary: {
                            DEFAULT: "hsl(35 30% 96%)",
                            foreground: "hsl(222 47% 11%)",
                        },
                        muted: {
                            DEFAULT: "hsl(210 40% 96%)",
                            foreground: "hsl(215 16% 47%)",
                        },
                        accent: {
                            DEFAULT: "hsl(38 45% 55%)",
                            foreground: "hsl(222 47% 11%)",
                        },
                        card: {
                            DEFAULT: "hsl(0 0% 100%)",
                            foreground: "hsl(222 47% 11%)",
                        }
                    },
                    fontFamily: {
                        heading: ['Outfit', 'sans-serif'],
                        body: ['Inter', 'sans-serif'],
                    },
                    animation: {
                        "fade-in": "fade-in 0.4s ease-out",
                    },
                    keyframes: {
                        "fade-in": {
                            from: { opacity: "0", transform: "translateY(10px)" },
                            to: { opacity: "1", transform: "translateY(0)" },
                        },
                    }
                }
            }
        }
    </script>
    
    <style type="text/tailwindcss">
        @layer base {
            body {
                @apply bg-background text-foreground antialiased;
                font-family: 'Inter', sans-serif;
            }
            h1, h2, h3, h4, h5, h6 {
                font-family: 'Outfit', sans-serif;
            }
        }
        @layer utilities {
            .heading-section {
                font-family: 'Outfit', sans-serif;
                @apply text-3xl md:text-4xl font-bold tracking-tight text-foreground;
            }
            .shadow-premium {
                box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 4px 10px -2px rgba(0, 0, 0, 0.02);
            }
            .shadow-card {
                box-shadow: 0 2px 12px -2px hsl(215 50% 23% / 0.08);
            }
        }
    </style>
</head>
<body class="selection:bg-primary/20">
    <div id="root">
        ${childHtml}
    </div>
</body>
</html>`;
};
