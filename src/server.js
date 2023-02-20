import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import express from "express"
import {config} from "dotenv"

const app = express()
app.use(express.json());
config()
const TOKEN = process.env.TOKEN

const bot = new TelegramBot(TOKEN, { polling: true });

const download = async (url) => {
    const options = {
        method: 'GET',
        url: 'https://instagram-downloader-download-instagram-videos-stories.p.rapidapi.com/index',
        params: { url },
        headers: {
            'X-RapidAPI-Key': '9ea5748716msh4cb3f676d47021dp17a992jsn7d30a9b73573',
            'X-RapidAPI-Host': 'instagram-downloader-download-instagram-videos-stories.p.rapidapi.com'
        }
    };

    try {
        return await axios.request(options)
    } catch (error) {
        console.log(error.response.data?.Msg)
    }
}

bot.on('message', async (m) => {
    const id = m?.chat?.id;
    try {
        if (m?.text === '/start') {
            await bot.sendMessage(id, `Salom ${m?.chat?.first_name}, men Yuksta. Instagram video havolasini yuboring`)
        } else if (m?.text.startsWith('https://instagram.com/stories/')) {
            bot.sendMessage(id, "Mmm.. bu story, hozir 1 daqiqa... 🕚")

            const res = await download(m?.text);

            await bot.sendVideo(id, res?.data?.media)

        } else if (m?.text.startsWith('https://www.instagram.com/p/')) {
            bot.sendMessage(id, "Uzr, lekin hozir rasm yuklaydigan imkoniyatim yo'q :(")
        } else {
            bot.sendMessage(id, "Mmm.. hozir 1 daqiqa... 🕚")

            const res = await download(m?.text);

            await bot.sendVideo(id, res?.data?.media, {
                caption: res?.data?.title
            })
        }

    } catch (err) {
        bot.sendMessage(id, "Uzr nimadur xatilik beryapti :(")
        console.log(err.response.body?.description)
    }
})

app.get('/', (req, res) => {
    res.send('yuksta api')
})

app.post('/', (req, res) => {
    res.send(req.body)
})

const PORT = 5000;

app.listen(process.env.PORT || PORT, () => {
    console.log('Server running')
})