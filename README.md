# dpma-search

Search the German Patent and Trademark Office (DPMA) register programmatically. Retrieves trademark data including status, Nice classifications, and owner information.

Uses [Kernel Cloud](https://onkernel.com/) for headless browser sessions and [Playwright](https://playwright.dev/) for page automation.

## How it works

The DPMA register doesn't offer a public API. This tool launches a cloud browser instance, navigates the register, and scrapes structured data from search results and detail pages.

## Features

- Full-text trademark search against the DPMA register
- Scrapes detail pages for each result (filing date, status, owner, address)
- Extracts Nice classifications with descriptions
- Optional JSON output for further processing
- Next.js web interface for browser-based searches

## Requirements

- [Bun](https://bun.sh) runtime
- [Kernel Cloud](https://onkernel.com/) account (for cloud browser sessions)

## Installation

```bash
git clone https://github.com/Synistic/dpma-search.git
cd dpma-search
bun install
```

## Usage

### CLI

```bash
bun run search "your trademark query"

# With JSON output
bun run search "your trademark query" --json
```

### Web Interface

```bash
bun run dev    # Start Next.js dev server
```

## Stack

- **Runtime:** Bun
- **Frontend:** Next.js, Tailwind CSS, Radix UI
- **Scraping:** Playwright via Kernel Cloud CDP
- **Language:** TypeScript

## License

MIT
