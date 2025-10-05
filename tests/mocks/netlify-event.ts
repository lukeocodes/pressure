import type { HandlerEvent, HandlerContext } from '@netlify/functions';

/**
 * Create a mock Netlify function event
 */
export function createMockEvent(
    httpMethodOrOverrides: string | Partial<HandlerEvent> = 'POST',
    body?: any
): HandlerEvent {
    // Support both old and new signatures
    let overrides: Partial<HandlerEvent>;
    
    if (typeof httpMethodOrOverrides === 'string') {
        overrides = {
            httpMethod: httpMethodOrOverrides,
            body: body ? JSON.stringify(body) : null,
        };
    } else {
        overrides = httpMethodOrOverrides;
    }
    
    return {
        rawUrl: 'http://localhost:8888/.netlify/functions/test',
        rawQuery: '',
        path: '/.netlify/functions/test',
        httpMethod: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        multiValueHeaders: {},
        queryStringParameters: {},
        multiValueQueryStringParameters: {},
        body: null,
        isBase64Encoded: false,
        ...overrides,
    };
}

/**
 * Create a mock Netlify function context
 */
export function createMockContext(): HandlerContext {
    return {
        callbackWaitsForEmptyEventLoop: true,
        functionName: 'test-function',
        functionVersion: '1',
        invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:test',
        memoryLimitInMB: '1024',
        awsRequestId: 'test-request-id',
        logGroupName: '/aws/lambda/test',
        logStreamName: 'test-stream',
        getRemainingTimeInMillis: () => 30000,
        done: () => { },
        fail: () => { },
        succeed: () => { },
        clientContext: undefined,
        identity: undefined,
    };
}

