import {
	makeWASocket,
	makeCacheableSignalKeyStore,
	fetchLatestWaWebVersion,
	delay,
} from "baileys";
import auth from "./auth";
import cache from "./cache";
import event from "./event";
import config from "../config";
import { cachedGroupMetadata } from "./group";
import { Green, Red, logger } from "lib";

const msgRetryCounterCache = cache();

const { state, saveCreds } = auth();
const { version } = await fetchLatestWaWebVersion({});

const sock = makeWASocket({
	auth: {
		creds: state.creds,
		keys: makeCacheableSignalKeyStore(state.keys, logger),
	},
	version,
	logger,
	msgRetryCounterCache,
	cachedGroupMetadata,
});

if (!sock.authState?.creds?.registered) {
	if (!config.USER_NUMBER) Red("Phone number required."), process.exit(1);
	await delay(2000);
	Green(
		`PAIR:`,
		await sock.requestPairingCode(
			config.USER_NUMBER?.replace(/\D/g, ""),
			"ASTROX11"
		)
	);
	while (!sock.authState?.creds?.registered) await delay(1000);
}

await event(sock, saveCreds).catch(console.error);
