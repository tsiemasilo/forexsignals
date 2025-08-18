// Advanced subscription testing and debugging utilities

export interface SubscriptionTestResult {
  userId: number;
  email: string;
  planId: number;
  planName: string;
  expectedDays: number;
  calculatedDays: number;
  backendDays: number;
  isCorrect: boolean;
  discrepancy: number;
  rawData: any;
}

export class SubscriptionTester {
  static testAllCalculationMethods(user: any, plans: any[]): SubscriptionTestResult | null {
    if (!user?.subscription) return null;

    const plan = plans.find(p => p.id === user.subscription.planId);
    if (!plan) return null;

    const startDate = new Date(user.subscription.startDate);
    const endDate = new Date(user.subscription.endDate);
    const currentDate = new Date();

    // Method 1: Backend endDate calculation
    const backendDays = Math.max(0, Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Method 2: Plan duration calculation
    const expectedDuration = plan.duration;
    const calculatedEndDate = new Date(startDate.getTime() + expectedDuration * 24 * 60 * 60 * 1000);
    const calculatedDays = Math.max(0, Math.ceil((calculatedEndDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Expected days should match plan duration minus elapsed days
    const daysElapsed = Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const expectedDays = Math.max(0, expectedDuration - daysElapsed);

    return {
      userId: user.id,
      email: user.email,
      planId: user.subscription.planId,
      planName: plan.name,
      expectedDays,
      calculatedDays,
      backendDays,
      isCorrect: Math.abs(backendDays - expectedDays) <= 1, // Allow 1 day tolerance
      discrepancy: backendDays - expectedDays,
      rawData: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        currentDate: currentDate.toISOString(),
        planDuration: expectedDuration,
        backendDuration: user.subscription.duration,
        daysElapsed,
        status: user.subscription.status
      }
    };
  }

  static generateTestReport(users: any[], plans: any[]): {
    totalTests: number;
    passedTests: number;
    failedTests: SubscriptionTestResult[];
    summary: string;
  } {
    const results = users
      .map(user => this.testAllCalculationMethods(user, plans))
      .filter(Boolean) as SubscriptionTestResult[];

    const failedTests = results.filter(r => !r.isCorrect);
    const passedTests = results.filter(r => r.isCorrect);

    return {
      totalTests: results.length,
      passedTests: passedTests.length,
      failedTests,
      summary: `${passedTests.length}/${results.length} tests passed. ${failedTests.length} discrepancies found.`
    };
  }

  static async testSubscriptionChange(userId: number, planId: number): Promise<{
    beforeChange: any;
    afterChange: any;
    apiResponse: any;
    testPassed: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];
    
    try {
      // Get user data before change
      const beforeResponse = await fetch('/api/admin/users');
      const beforeUsers = await beforeResponse.json();
      const beforeUser = beforeUsers.find((u: any) => u.id === userId);

      if (!beforeUser) {
        issues.push(`User ${userId} not found`);
        return { beforeChange: null, afterChange: null, apiResponse: null, testPassed: false, issues };
      }

      // Make the subscription change
      const changeResponse = await fetch(`/api/admin/users/${userId}/subscription`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active', planId })
      });
      const apiResponse = await changeResponse.json();

      if (!changeResponse.ok) {
        issues.push(`API call failed: ${apiResponse.message || changeResponse.statusText}`);
        return { beforeChange: beforeUser, afterChange: null, apiResponse, testPassed: false, issues };
      }

      // Wait a moment for cache to update
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get user data after change
      const afterResponse = await fetch('/api/admin/users');
      const afterUsers = await afterResponse.json();
      const afterUser = afterUsers.find((u: any) => u.id === userId);

      if (!afterUser) {
        issues.push(`User ${userId} not found after change`);
        return { beforeChange: beforeUser, afterChange: null, apiResponse, testPassed: false, issues };
      }

      // Validate the change
      const expectedPlanChanged = afterUser.subscription?.planId === planId;
      if (!expectedPlanChanged) {
        issues.push(`Plan ID not updated: expected ${planId}, got ${afterUser.subscription?.planId}`);
      }

      const hasValidDuration = afterUser.subscription?.duration > 0;
      if (!hasValidDuration) {
        issues.push(`Invalid duration: ${afterUser.subscription?.duration}`);
      }

      return {
        beforeChange: beforeUser,
        afterChange: afterUser,
        apiResponse,
        testPassed: expectedPlanChanged && hasValidDuration && issues.length === 0,
        issues
      };

    } catch (error) {
      issues.push(`Test failed with error: ${error}`);
      return { beforeChange: null, afterChange: null, apiResponse: null, testPassed: false, issues };
    }
  }
}

// Console testing utilities
export const adminTestUtils = {
  logUser: (user: any) => {
    console.table({
      ID: user.id,
      Email: user.email,
      Plan: user.subscription?.planName || 'None',
      Status: user.subscription?.status || 'None',
      Duration: user.subscription?.duration || 'N/A',
      StartDate: user.subscription?.startDate || 'N/A',
      EndDate: user.subscription?.endDate || 'N/A'
    });
  },

  logAllUsers: (users: any[]) => {
    users.forEach(user => {
      console.group(`User ${user.id}: ${user.email}`);
      adminTestUtils.logUser(user);
      console.groupEnd();
    });
  },

  testDaysCalculation: (user: any, plans: any[]) => {
    const result = SubscriptionTester.testAllCalculationMethods(user, plans);
    if (result) {
      console.group(`Days Test: ${user.email}`);
      console.table(result);
      console.log('Raw Data:', result.rawData);
      console.groupEnd();
    }
  }
};