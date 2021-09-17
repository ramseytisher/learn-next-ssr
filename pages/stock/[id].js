import { useState, useEffect } from "react";

import { useRouter } from "next/router";
import {
  Amplify,
  API,
  Auth,
  withSSRContext,
  graphqlOperation,
} from "aws-amplify";

import { getStock as GetStock } from "../../src/graphql/queries";
import awsExports from "../../src/aws-exports";

Amplify.configure({ ...awsExports, ssr: true });

export default function Stock() {
  const router = useRouter();
  const { id } = router.query;

  const [stockInfo, setStockInfo] = useState(null);

  useEffect(() => {
    getStockInfo();
  }, [id]);

  async function getStockInfo() {
    try {
      if (id) {
        console.log(
          await API.graphql(
            graphqlOperation(GetStock, {
              id: id,
            })
          )
        );
        const { data } = await API.graphql(
          graphqlOperation(GetStock, {
            id: id,
          })
        );

        setStockInfo(data.getStock);
      } else {
        console.log("No ID!!!");
      }
    } catch ({ errors }) {
      console.error(...errors);
      throw new Error(errors[0].message);
    }
  }

  return <code>Stock: {JSON.stringify(stockInfo, null, 2)}</code>;
}
