import { DynamoDBClient, PutItemCommand, BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";
const ddb = new DynamoDBClient({});

export const handler = async (event) => {
    const body = JSON.parse(event.body);
    const { user_id, responses, booklet_id, ts } = body;

    const puts = Object.entries(responses).map(([qid, ans]) => ({
        Put: {
            TableName: "SpatialSurveyResponses",
            Item: {
                PK: { S: `user#${user_id}` },
                SK: { S: `q#${qid}` },
                booklet_id: { N: String(booklet_id) },
                answer: { S: ans },
                ts: { N: String(ts) }
            }
        }
    }));

    await ddb.send(new BatchWriteItemCommand({ RequestItems: { SpatialSurveyResponses: puts } }));
    return { statusCode: 204, headers: { "Access-Control-Allow-Origin": "*" } };
};