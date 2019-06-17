/*jslint node: true */

'use strict';

const AWS = require('aws-sdk'); 
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.myBrands = function(event, context){

    var cognitoUserName = event.requestContext.authorizer.claims["cognito:username"].toLowerCase();

    var params = {
        TableName: process.env.CANDIDATE_TABLE,
        KeyConditionExpression: "#id = :value",
        ExpressionAttributeNames:{
            "#id": "id"
        },
        ExpressionAttributeValues: {
            ":value": cognitoUserName
        }
    };

    console.log("Querying table for ", cognitoUserName, 'params: ', params);

    dynamoDb.query(params, (err, data) => {
        if (err) {
            console.error('Query failed to load data. Error JSON: ', JSON.stringify(err, null, 2));
            const response = {
                statusCode: err.statusCode || 501,
                headers: { 'Content-Type': 'text/plain' },
                error: err,
                body: 'Couldn\'t fetch the brands',
            }
            return response;
        }

        console.log("Query succeeded: ", data);

        const response = {
            statusCode: 200,
            headers: {
                "x-custom-header" : "My Header Value"
            },
        body: JSON.stringify({ 
                message: "Hello World!",
                cognitoUserName: cognitoUserName,
                items: JSON.stringify(data.Items),
            })
        };
    
       return response;
    });
};
