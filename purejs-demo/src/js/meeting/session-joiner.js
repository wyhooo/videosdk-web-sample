import sessionConfig from '../config';
import { generateSessionToken } from '../tool';
import initClientEventListeners from './session/client-event-listeners';
import initButtonClickHandlers from './session/button-click-handlers';
import state from './session/simple-state';

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
/**
 * Creates a zoom video client, and uses it to join/start a video session. It:
 *      1) Creates a zoom client
 *      2) Initializes the zoom client
 *      3) Tries to join a session, grabbing its Stream once successful
 *      4) Initializes the zoom client's important "on" event listeners
 *          - Very important, as failing to do so ASAP can miss important updates
 *      5) Joins the audio stream on mute
 */
const joinSession = async (zmClient) => {
  // const videoSDKLibDir = '/lib';
  const zmClientInitParams = {
    language: 'en-US'
    // dependentAssets: `${window.location.origin}${videoSDKLibDir}`
  };
  const sdkKey = document.getElementById('info_sdkkey').value;
  const sdkSecret = document.getElementById('info_sdksecret').value;
  const topic = document.getElementById('info_topic').value;
  const name = document.getElementById('info_name').value;
  const password = document.getElementById('info_password').value;
  const role = Number(document.getElementById('info_role').value);
  const sessionToken = generateSessionToken(sdkKey, sdkSecret, topic, password, sessionConfig.sessionKey, '', role);
  let mediaStream;

  const initAndJoinSession = async () => {
    await zmClient.init(zmClientInitParams.language, zmClientInitParams.dependentAssets);
    console.log('session token: ', sessionToken);
    try {
      await zmClient.join(topic, sessionToken, name, password);
      mediaStream = zmClient.getMediaStream();
      console.log(zmClient.getSessionInfo());
      state.selfId = zmClient.getSessionInfo().userId;
    } catch (e) {
      console.error(e);
    }
  };

  const startAudioMuted = async () => {
    await mediaStream.startAudio();
    state.isStartedAudio = true;
    if (!mediaStream.isAudioMuted()) {
      mediaStream.muteAudio();
    }
  };

  const join = async () => {
    console.log('======= Initializing video session =======');
    await initAndJoinSession();
    /**
     * Note: it is STRONGLY recommended to initialize the client listeners as soon as
     * the session is initialized. Once the user joins the session, updates are sent to
     * the event listeners that help update the session's participant state.
     *
     * If you choose not to do so, you'll have to manually deal with race conditions.
     * You should be able to call "zmClient.getAllUser()" after the app has reached
     * steady state, meaning a sufficiently-long time
     */
    console.log('======= Initializing client event handlers =======');
    initClientEventListeners(zmClient, mediaStream);
    console.log('======= Starting audio muted =======');
    if (!isSafari) {
      await startAudioMuted();
    }

    console.log('======= Initializing button click handlers =======');
    await initButtonClickHandlers(zmClient, mediaStream);
    console.log('======= Session joined =======');
  };

  await join();
  return zmClient;
};

export default joinSession;
