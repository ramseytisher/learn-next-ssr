/* Amplify Params - DO NOT EDIT
	API_LEARNNEXTSSR_GRAPHQLAPIENDPOINTOUTPUT
	API_LEARNNEXTSSR_GRAPHQLAPIIDOUTPUT
	API_LEARNNEXTSSR_GRAPHQLAPIKEYOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const axios = require("axios");
const gql = require("graphql-tag");
const graphql = require("graphql");
const { print } = graphql;

const createStock = gql`
  mutation createStock($input: CreateStockInput!) {
    createStock(input: $input) {
      id
      ticker
      description
      eps
      createdAt
      updatedAt
    }
  }
`;

const listStocks = gql`
  query listStocks {
    listStocks {
      items {
        id
        ticker
      }
    }
  }
`;

exports.handler = async (event) => {
  try {

    console.log("TRY FINDING: ", event.arguments.ticker)  
    const stockData = await axios({
      method: "get",
      url: `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${event.arguments.ticker}&apikey=6GUGOE51J9KLH0O2`,
    });

    console.log("STOCK DATA >>>", stockData.data)

    const current = await axios({
      url: process.env.API_LEARNNEXTSSR_GRAPHQLAPIENDPOINTOUTPUT,
      method: "post",
      headers: {
        "x-api-key": process.env.API_LEARNNEXTSSR_GRAPHQLAPIKEYOUTPUT,
      },
      data: {
        query: print(listStocks),
      },
    });

    console.log("LIST STOCKS: ", current)

    if (
      current.data.data.listStocks.items.findIndex(
        (i) => i.ticker === event.arguments.ticker
      ) === -1
    ) {
      // Then we need to add this stock
      const create = await axios({
        url: process.env.API_LEARNNEXTSSR_GRAPHQLAPIENDPOINTOUTPUT,
        method: "post",
        headers: {
          "x-api-key": process.env.API_LEARNNEXTSSR_GRAPHQLAPIKEYOUTPUT,
        },
        data: {
          query: print(createStock),
          variables: {
            input: {
              ticker: event.arguments.ticker,
              description: stockData.data.Name,
              eps: stockData.data.EPS,
            },
          },
        },
      });

      return create.data.data.createStock;
    } else {
      // We say we already have this stock
      console.log('WE ALREADY HAVE THIS STOCK')
      return "Stock already exists...";
    }
  } catch (err) {
    console.log("Error adding stock: ", err);
    return "Error adding stock ...";
  }
  return "Hello";
};
