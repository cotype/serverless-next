'use strict';

function ucFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = function createStages(serverless, plugin) {
  const { stages, basePath } = plugin.getOptions();

  const url = [
    'https://',
    {
      Ref: 'ApiGatewayRestApi',
    },
    '.execute-api.',
    {
      Ref: 'AWS::Region',
    },
    '.amazonaws.com/',
    serverless.service.provider.stage,
    basePath,
  ];

  const update = {
    resources: {
      Resources: stages.reduce((memo, name) => {
        /* eslint-disable-next-line no-param-reassign */
        memo[`ApiGatewayResourceStage${ucFirst(name)}`] = {
          Type: 'AWS::ApiGateway::Resource',
          Properties: {
            ParentId: {
              'Fn::GetAtt': ['ApiGatewayRestApi', 'RootResourceId'],
            },
            PathPart: name,
            RestApiId: {
              Ref: 'ApiGatewayRestApi',
            },
          },
        };
        /* eslint-disable-next-line no-param-reassign */
        memo[`ApiGatewayResourceStageAnyVar${ucFirst(name)}`] = {
          Type: 'AWS::ApiGateway::Resource',
          Properties: {
            ParentId: {
              Ref: `ApiGatewayResourceStage${ucFirst(name)}`,
            },
            PathPart: '{proxy+}',
            RestApiId: {
              Ref: 'ApiGatewayRestApi',
            },
          },
        };
        /* eslint-disable-next-line no-param-reassign */
        memo[`ApiGatewayResourceStageRootMethod${ucFirst(name)}`] = {
          Type: 'AWS::ApiGateway::Method',
          Properties: {
            HttpMethod: 'ANY',
            ResourceId: { Ref: `ApiGatewayResourceStage${ucFirst(name)}` },
            RestApiId: { Ref: 'ApiGatewayRestApi' },
            AuthorizationType: 'NONE',
            Integration: {
              IntegrationHttpMethod: 'ANY',
              Type: 'HTTP_PROXY',
              RequestParameters: {
                'integration.request.header.X-Cotype-Next-Stage': `'${name}'`,
              },
              Uri: {
                'Fn::Join': ['', url],
              },
              PassthroughBehavior: 'WHEN_NO_MATCH',
              IntegrationResponses: [
                {
                  StatusCode: 200,
                },
              ],
            },
          },
        };

        /* eslint-disable-next-line no-param-reassign */
        memo[`ApiGatewayResourceStageMethod${ucFirst(name)}`] = {
          Type: 'AWS::ApiGateway::Method',
          Properties: {
            HttpMethod: 'ANY',
            ResourceId: {
              Ref: `ApiGatewayResourceStageAnyVar${ucFirst(name)}`,
            },
            RestApiId: { Ref: 'ApiGatewayRestApi' },
            AuthorizationType: 'NONE',
            RequestParameters: {
              'method.request.path.proxy': true,
            },
            Integration: {
              CacheKeyParameters: ['method.request.path.proxy'],
              IntegrationHttpMethod: 'ANY',
              Type: 'HTTP_PROXY',
              RequestParameters: {
                'integration.request.path.proxy': 'method.request.path.proxy',
                'integration.request.header.X-Cotype-Next-Stage': `'${name}'`,
              },
              Uri: {
                'Fn::Join': ['', url.concat('/{proxy}')],
              },
              PassthroughBehavior: 'WHEN_NO_MATCH',
              IntegrationResponses: [
                {
                  StatusCode: 200,
                },
              ],
            },
          },
        };

        return memo;
      }, {}),
    },
  };

  serverless.service.update(update);
};

// functions: stages.reduce((memo, { name }) => {
//   /* eslint-disable-next-line no-param-reassign */
//   memo[`nextStage-${name}`] = {
//     handler: path
//       .relative(
//         serverless.config.servicePath,
//         require.resolve('../dist/stage.js'),
//       )
//       .replace(/\.js$/, '.stage'),
//     timeout: 30,
//     memorySize: 128,
//     environment: {
//       NEXT_STAGE: name,
//       TARGET_URL: {
//         'Fn::Join': [
//           '',
//           [
//             'https://',
//             { Ref: 'ApiGatewayRestApi' },
//             '.execute-api.',
//             serverless.service.provider.region,
//             '.amazonaws.com/',
//             serverless.service.provider.stage,
//             basePath,
//           ],
//         ],
//       },
//     },
//     events: ['GET', 'HEAD'].reduce((events, method) => {
//       return events.concat([
//         {
//           http: {
//             path: `${stagePrefix}/${name}`,
//             cors: true,
//             method,
//           },
//         },
//         {
//           http: {
//             path: `${stagePrefix}/${name}/{any+}`,
//             cors: true,
//             method,
//           },
//         },
//       ]);
//     }, []),
//   };

//   return memo;
// }, {}),
