import { type NextPage } from "next";
import Head from "next/head";
import React from "react";
import dynamic from "next/dynamic";

const Avatar = dynamic(() => import("../components/avatar"), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Insula: Twitch Streamer</title>
        <meta name="description" content="Insula is an AI twitch streamer" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="avatarContainer bg-green-500 draggable overflow-hidden">
        <Avatar/>
      </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     </>
  );
};

export default Home;
