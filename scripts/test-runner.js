#!/usr/bin/env node

/**
 * Comprehensive Test Runner for CV Tutorial Website
 * 
 * This script runs all types of tests in the correct order and generates reports
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n🚀 ${description}`, 'cyan');
  log(`Running: ${command}`, 'blue');
  
  try {
    const output = execSync(command, { 
      stdio: 'inherit', 
      encoding: 'utf8',
      cwd: process.cwd()
    });
    log(`✅ ${description} completed successfully`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} failed`, 'red');
    log(`Error: ${error.message}`, 'red');
    return false;
  }
}

function createReportsDirectory() {
  const reportsDir = join(process.cwd(), 'test-reports');
  if (!existsSync(reportsDir)) {
    mkdirSync(reportsDir, { recursive: true });
  }
  return reportsDir;
}

function generateTestReport(results) {
  const reportsDir = createReportsDirectory();
  const reportPath = join(reportsDir, 'test-summary.json');
  
  const report = {
    timestamp: new Date().toISOString(),
    results,
    summary: {
      total: results.length,
      passed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      successRate: `${Math.round((results.filter(r => r.success).length / results.length) * 100)}%`
    }
  };
  
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`📊 Test report generated: ${reportPath}`, 'magenta');
  
  return report;
}

async function main() {
  log('🧪 Starting Comprehensive Test Suite for CV Tutorial Website', 'bright');
  log('=' .repeat(60), 'cyan');
  
  const testResults = [];
  
  // 1. Unit Tests
  const unitTestSuccess = runCommand(
    'npx vitest --run --reporter=verbose tests/components tests/utils',
    'Unit Tests (Components & Utilities)'
  );
  testResults.push({ name: 'Unit Tests', success: unitTestSuccess });
  
  // 2. Integration Tests
  const integrationTestSuccess = runCommand(
    'npx vitest --run --reporter=verbose tests/integration',
    'Integration Tests (Navigation Flows)'
  );
  testResults.push({ name: 'Integration Tests', success: integrationTestSuccess });
  
  // 3. Accessibility Tests
  const accessibilityTestSuccess = runCommand(
    'npx vitest --run --reporter=verbose tests/accessibility',
    'Accessibility Tests (Unit Level)'
  );
  testResults.push({ name: 'Accessibility Tests', success: accessibilityTestSuccess });
  
  // 4. Performance Tests
  const performanceTestSuccess = runCommand(
    'npx vitest --run --reporter=verbose tests/performance',
    'Performance Tests'
  );
  testResults.push({ name: 'Performance Tests', success: performanceTestSuccess });
  
  // 5. Test Coverage
  const coverageSuccess = runCommand(
    'npx vitest --coverage --run',
    'Test Coverage Analysis'
  );
  testResults.push({ name: 'Coverage Analysis', success: coverageSuccess });
  
  // 6. Build Test
  const buildSuccess = runCommand(
    'npm run build',
    'Build Test (TypeScript Compilation & Bundling)'
  );
  testResults.push({ name: 'Build Test', success: buildSuccess });
  
  // 7. E2E Tests (only if build succeeded)
  if (buildSuccess) {
    log('\n🎭 Installing Playwright browsers (if needed)...', 'yellow');
    try {
      execSync('npx playwright install --with-deps', { stdio: 'inherit' });
    } catch (error) {
      log('⚠️  Playwright installation failed, skipping E2E tests', 'yellow');
    }
    
    const e2eSuccess = runCommand(
      'npx playwright test',
      'End-to-End Tests (Cross-browser)'
    );
    testResults.push({ name: 'E2E Tests', success: e2eSuccess });
    
    // E2E Accessibility Tests
    const e2eAccessibilitySuccess = runCommand(
      'npx playwright test e2e/accessibility.spec.ts',
      'E2E Accessibility Tests'
    );
    testResults.push({ name: 'E2E Accessibility', success: e2eAccessibilitySuccess });
  } else {
    log('⚠️  Skipping E2E tests due to build failure', 'yellow');
    testResults.push({ name: 'E2E Tests', success: false, skipped: true });
  }
  
  // Generate comprehensive report
  log('\n📊 Generating Test Report...', 'magenta');
  const report = generateTestReport(testResults);
  
  // Display summary
  log('\n' + '='.repeat(60), 'cyan');
  log('🏁 TEST SUITE SUMMARY', 'bright');
  log('='.repeat(60), 'cyan');
  
  testResults.forEach(result => {
    const status = result.skipped ? '⏭️  SKIPPED' : result.success ? '✅ PASSED' : '❌ FAILED';
    const color = result.skipped ? 'yellow' : result.success ? 'green' : 'red';
    log(`${status} ${result.name}`, color);
  });
  
  log(`\n📈 Overall Success Rate: ${report.summary.successRate}`, 'bright');
  log(`📊 Tests Passed: ${report.summary.passed}/${report.summary.total}`, 'green');
  
  if (report.summary.failed > 0) {
    log(`💥 Tests Failed: ${report.summary.failed}`, 'red');
  }
  
  // Additional recommendations
  log('\n💡 RECOMMENDATIONS:', 'yellow');
  
  if (report.summary.successRate === '100%') {
    log('🎉 All tests passed! Your code is ready for production.', 'green');
  } else {
    log('🔧 Some tests failed. Please review the output above and fix issues.', 'yellow');
  }
  
  log('📚 For detailed reports, check:', 'blue');
  log('  - Coverage: coverage/index.html', 'blue');
  log('  - E2E Results: playwright-report/index.html', 'blue');
  log('  - Test Summary: test-reports/test-summary.json', 'blue');
  
  // Exit with appropriate code
  const allPassed = testResults.filter(r => !r.skipped).every(r => r.success);
  process.exit(allPassed ? 0 : 1);
}

// Handle CLI arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  log('CV Tutorial Website Test Runner', 'bright');
  log('\nUsage: node scripts/test-runner.js [options]', 'blue');
  log('\nOptions:', 'yellow');
  log('  --help, -h     Show this help message');
  log('  --unit         Run only unit tests');
  log('  --integration  Run only integration tests');
  log('  --e2e          Run only E2E tests');
  log('  --accessibility Run only accessibility tests');
  log('  --performance  Run only performance tests');
  log('  --coverage     Run tests with coverage');
  process.exit(0);
}

// Handle specific test type requests
if (args.includes('--unit')) {
  runCommand('npx vitest --run tests/components tests/utils', 'Unit Tests Only');
} else if (args.includes('--integration')) {
  runCommand('npx vitest --run tests/integration', 'Integration Tests Only');
} else if (args.includes('--e2e')) {
  runCommand('npx playwright test', 'E2E Tests Only');
} else if (args.includes('--accessibility')) {
  runCommand('npx vitest --run tests/accessibility && npx playwright test e2e/accessibility.spec.ts', 'Accessibility Tests Only');
} else if (args.includes('--performance')) {
  runCommand('npx vitest --run tests/performance', 'Performance Tests Only');
} else if (args.includes('--coverage')) {
  runCommand('npx vitest --coverage --run', 'Coverage Analysis Only');
} else {
  // Run full test suite
  main().catch(error => {
    log(`💥 Test runner failed: ${error.message}`, 'red');
    process.exit(1);
  });
}