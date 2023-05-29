import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

const generateAction = async (req: NextApiRequest, res: NextApiResponse) => {

	// if (!session) {
	// 	res.status(400).json({
	// 		responseType: ApiResponseType.UnauthenticatedUser,
	// 	})
	// 	return
	// }
	res.setHeader('Content-Type', 'application/json')
	console.log("getting spech token")
	if (
		process.env.SPEECH_KEY === 'paste-your-speech-key-here' ||
		process.env.SPEECH_REGION === 'paste-your-speech-region-here'
	) {
		res
			.status(400)
			.send('You forgot to add your speech key or region to the .env file.')
	} else {
		const headers = {
			headers: {
				'Ocp-Apim-Subscription-Key': process.env.SPEECH_KEY,
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		};
		try {
			console.log("SPEECH_REGION", process.env.SPEECH_REGION)
			console.log("SPEECH_KEY", process.env.SPEECH_KEY)
			const tokenResponse = await axios.post(
				`https://${process.env.SPEECH_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
				null,
				headers,
			)
			console.log("tokenResponse.data", tokenResponse.data);
			res.status(200).json({ token: tokenResponse.data, region: process.env.SPEECH_REGION })

		} catch (err) {
			console.log(err)
			res.status(401).send('There was an error authorizing your speech key.')
		}
	}
}

export default generateAction
