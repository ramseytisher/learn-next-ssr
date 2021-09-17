import { useState, useEffect } from "react";

import { AmplifyAuthenticator } from "@aws-amplify/ui-react";
import {
  Amplify,
  API,
  Auth,
  withSSRContext,
  graphqlOperation,
} from "aws-amplify";

import Head from "next/head";
import awsExports from "../src/aws-exports";

import {
  addStock as AddStock,
  deleteStock as DeleteStock,
} from "../src/graphql/mutations";

import { listStocks } from "../src/graphql/queries";
import styles from "../styles/Home.module.css";

Amplify.configure({ ...awsExports, ssr: true });

export async function getServerSideProps({ req }) {
  const SSR = withSSRContext({ req });
  const response = await SSR.API.graphql({ query: listStocks });

  return {
    props: {
      stocks: response.data.listStocks.items,
    },
  };
}

export default function Home() {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    getStocks();
  }, [])

  async function getStocks() {
    try {
      const { data } = await API.graphql(graphqlOperation(listStocks));
      setStocks(data.listStocks.items);
    } catch (err) {
      console.log("error getting stocks");
    }
  }

  async function handleCreateStock(event) {
    event.preventDefault();

    const form = new FormData(event.target);

    try {
      const { data } = await API.graphql(
        graphqlOperation(AddStock, {
          ticker: form.get("ticker"),
        })
      );
      setStocks([...stocks, data.addStock]);
    } catch ({ errors }) {
      console.error(...errors);
      throw new Error(errors[0].message);
    }
  }

  async function handleDeleteStock(id) {
    try {
      const deleteItem = await API.graphql(
        graphqlOperation(DeleteStock, {
          input: {
            id: id,
          },
        })
      );
      setStocks(stocks.filter((stock) => stock.id !== id));
    } catch ({ errors }) {
      console.log("ERRORS DELETING: ", ...errors);
      throw new Error(errors[0].message);
    }
  }
  return (
    <div className={styles.container}>
      <Head>
        <title>Amplify + Next.js</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Amplify + Next.js</h1>

        <p className={styles.description}>
          <code className={styles.code}>{stocks.length}</code>
          stocks
        </p>

        <div className={styles.grid}>
          {stocks.map((stock) => (
            <div key={stock.id}>
              <a
                className={styles.card}
                href={`/stock/${stock.id}`}
                key={stock.id}
              >
                <h3>{stock.ticker}</h3>
              </a>
              <button onClick={() => handleDeleteStock(stock.id)}>x</button>
            </div>
          ))}

          <div className={styles.card}>
            <p className={styles.title}>New Stock</p>

            {/* <AmplifyAuthenticator> */}
            <form onSubmit={handleCreateStock}>
              <fieldset>
                <legend>Ticker</legend>
                <input defaultValue={``} name="ticker" />
              </fieldset>

              {/* <fieldset>
                  <legend>Content</legend>
                  <textarea
                    defaultValue="I built an Amplify app with Next.js!"
                    name="content"
                  />
                </fieldset> */}

              <button>Create Stock</button>
              {/* <button type="button" onClick={() => Auth.signOut()}>
                  Sign out
                </button> */}
            </form>
            {/* </AmplifyAuthenticator> */}
          </div>
        </div>
      </main>
    </div>
  );
}
