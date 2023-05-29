import * as speechsdk from "microsoft-cognitiveservices-speech-sdk";

export const speakOnce = (text: string, tokenObj, setVisemes, voiceName) => {
  const config = speechsdk.SpeechTranslationConfig.fromAuthorizationToken(
    tokenObj.authToken,
    tokenObj.region
  );
  config.speechSynthesisOutputFormat = speechsdk.SpeechSynthesisOutputFormat.Audio24Khz96KBitRateMonoMp3;

  config.speechSynthesisLanguage = "en-US";
  config.speechSynthesisVoiceName = voiceName;

  const player = new speechsdk.SpeakerAudioDestination();
  const audioConfig = speechsdk.AudioConfig.fromSpeakerOutput(player);
  let synthesizer = new speechsdk.SpeechSynthesizer(config, audioConfig);
  synthesizer.synthesisCompleted = function () {
      synthesizer.close();
      synthesizer = null;
  };
  const visemes = []
  synthesizer.visemeReceived = function (s, e) {
    // debugger;
    visemes.unshift(e)
  }
  setVisemes(visemes)


  const ssmlPrefix = `<speak version='1.0' xmlns='https://www.w3.org/2001/10/synthesis' xml:lang='en-US'><voice name='${voiceName}'>`

  const ssmlSuffix = "</voice></speak>";

  console.log("speakSsmlAsync:", text)
  synthesizer.speakSsmlAsync(`${ssmlPrefix}${text}${ssmlSuffix}`, () => { /* do nothing */}, (err) => {console.log(err)});
}
