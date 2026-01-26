#!/bin/bash
# ==============================================================================
# Badge Generator for README shields
# ==============================================================================
# Generates security badge based on scan results for README.md
#
# Usage:
#   ./scripts/generate-badge.sh
#
# Output:
#   Badge URL for shields.io or badgen.net
# ==============================================================================

set -e

# Run scan and capture exit code
if node dist/cli/main.js scan --format json > /tmp/scan-result.json 2>/dev/null; then
    STATUS="passing"
    COLOR="brightgreen"
else
    EXIT_CODE=$?
    if [ $EXIT_CODE -eq 1 ]; then
        STATUS="failing"
        COLOR="red"
    else
        STATUS="error"
        COLOR="orange"
    fi
fi

# Extract violation count
VIOLATIONS=$(jq -r '.summary.totalViolations // 0' /tmp/scan-result.json 2>/dev/null || echo "0")
MAX_SEVERITY=$(jq -r '.summary.maxSeverity // "NONE"' /tmp/scan-result.json 2>/dev/null || echo "NONE")

# Generate badge URL
BADGE_URL="https://img.shields.io/badge/security-${STATUS}-${COLOR}"

echo "Security Status: $STATUS"
echo "Total Violations: $VIOLATIONS"
echo "Max Severity: $MAX_SEVERITY"
echo ""
echo "Badge URL:"
echo "$BADGE_URL"
echo ""
echo "Markdown:"
echo "![Security Status]($BADGE_URL)"
