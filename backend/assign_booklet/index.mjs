import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
const BOOKLET_N = 19;
const ddb = new DynamoDBClient({});

export const handler = async () => {
    const id = Math.floor(Math.random() * BOOKLET_N);
    // 可选：计数写入表 BookletStats
    await ddb.send(new UpdateItemCommand({
        TableName: "BookletStats",
        Key: { bid: { N: String(id) } },
        UpdateExpression: "ADD cnt :one",
        ExpressionAttributeValues: { ":one": { N: "1" } }
    })).catch(() => { });
    return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ booklet_id: id })
    };
};