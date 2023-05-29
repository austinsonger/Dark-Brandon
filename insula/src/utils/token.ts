import Cookie from "universal-cookie";

export const getTokenOrRefresh = async () => {
  const cookie = new Cookie();
  const speechToken = cookie.get("speech-token");

  if (speechToken === undefined || speechToken.includes("undefined")) {
    try {
      const getSpeechTokenRequest = await fetch("/api/getSpeechToken");
      const res = await getSpeechTokenRequest.json();
      const token = res.token;
      const region = res.region;
      cookie.set("speech-token", region + ":" + token, {
        maxAge: 540,
        path: "/",
      });

      console.log("Token fetched from back-end: " + token);
      return { authToken: token, region: region };
    } catch (err) {
      console.log("Error fetching token: " + err);
      return { authToken: null };
    }
  } else {
    const idx = speechToken.indexOf(":");
    return {
      authToken: speechToken.slice(idx + 1),
      region: speechToken.slice(0, idx),
    };
  }
}
