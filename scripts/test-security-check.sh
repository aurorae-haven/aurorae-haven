#!/bin/bash
# Test script for CI/CD security check logic
# This script validates that the security vulnerability detection works correctly

set -euo pipefail

echo "🔍 Testing CI/CD Security Check Logic"
echo "========================================"
echo ""

TESTS_PASSED=0
TESTS_FAILED=0

# Test function
test_pattern() {
  local test_name="$1"
  local input="$2"
  local expected="$3"
  
  echo -n "Test: $test_name ... "
  
  # Use the same pattern as the CI/CD workflow
  if echo "$input" | grep -qE "found [1-9][0-9]* vulnerabilities"; then
    result="HAS_VULNERABILITIES"
  else
    result="NO_VULNERABILITIES"
  fi
  
  if [ "$result" = "$expected" ]; then
    echo "✓ PASS"
    ((TESTS_PASSED++))
  else
    echo "❌ FAIL (expected: $expected, got: $result)"
    ((TESTS_FAILED++))
  fi
}

# Run tests
echo "Basic Tests:"
echo "------------"
test_pattern "Zero vulnerabilities" "found 0 vulnerabilities" "NO_VULNERABILITIES"
test_pattern "One vulnerability" "found 1 vulnerabilities" "HAS_VULNERABILITIES"
test_pattern "Single digit (5)" "found 5 vulnerabilities (3 moderate, 2 low)" "HAS_VULNERABILITIES"
test_pattern "Double digit (10)" "found 10 vulnerabilities" "HAS_VULNERABILITIES"
test_pattern "Double digit (99)" "found 99 vulnerabilities" "HAS_VULNERABILITIES"
test_pattern "Triple digit (123)" "found 123 vulnerabilities" "HAS_VULNERABILITIES"
echo ""

echo "Edge Cases:"
echo "-----------"
test_pattern "Exactly 9 vulnerabilities" "found 9 vulnerabilities" "HAS_VULNERABILITIES"
test_pattern "Exactly 10 vulnerabilities" "found 10 vulnerabilities" "HAS_VULNERABILITIES"
test_pattern "Large number (1000+)" "found 1234 vulnerabilities" "HAS_VULNERABILITIES"
echo ""

echo "Severity Detection:"
echo "------------------"
# Test severity detection
echo -n "Test: High severity detection ... "
if echo -e "found 2 vulnerabilities\n1 high severity" | grep -qE "(high|critical) severity"; then
  echo "✓ PASS"
  ((TESTS_PASSED++))
else
  echo "❌ FAIL"
  ((TESTS_FAILED++))
fi

echo -n "Test: Critical severity detection ... "
if echo -e "found 2 vulnerabilities\n1 critical severity" | grep -qE "(high|critical) severity"; then
  echo "✓ PASS"
  ((TESTS_PASSED++))
else
  echo "❌ FAIL"
  ((TESTS_FAILED++))
fi

echo -n "Test: No high/critical severity ... "
if echo -e "found 2 vulnerabilities\n2 moderate severity" | grep -qE "(high|critical) severity"; then
  echo "❌ FAIL (false positive)"
  ((TESTS_FAILED++))
else
  echo "✓ PASS"
  ((TESTS_PASSED++))
fi
echo ""

# Summary
echo "========================================"
echo "Test Results:"
echo "  Passed: $TESTS_PASSED"
echo "  Failed: $TESTS_FAILED"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo "✅ All tests passed!"
  exit 0
else
  echo "❌ Some tests failed!"
  exit 1
fi
