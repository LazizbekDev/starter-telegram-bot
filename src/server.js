import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import express from "express"
import { config } from "dotenv"
import cron from "node-cron"

const app = express()
app.use(express.json());
config()
const TOKEN = process.env.TOKEN
const url = "https://yukta.onrender.com/"

const bot = new TelegramBot(TOKEN, { polling: true });

bot.setWebHook(`${url}/bot${TOKEN}`)

cron.schedule('* * * * *', async () => {
    const res = await axios.get('https://yukta.onrender.com/')
    console.log(res.data);
});

app.get('/', (req, res) => {
    res.send('yuksta api')
})

app.post('/', (req, res) => {
    res.send(req.body)
})

app.post(`/bot${TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});


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

const tikTokVideo = async (e) => {
    const options = {
        method: 'GET',
        url: 'https://tiktok-video-no-watermark2.p.rapidapi.com/',
        params: {url: e, hd: '0'},
        headers: {
          'X-RapidAPI-Key': '06fdc64e18mshc6e2868dc26e1c6p1b76e6jsnd8718f1785de',
          'X-RapidAPI-Host': 'tiktok-video-no-watermark2.p.rapidapi.com'
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
        } else if (m?.text.startsWith('https://www.tiktok.com/')
         || m?.text.startsWith("https://vt.tiktok.com/")) {
            bot.sendMessage(id, "Mmm.. Tiktok, hozir 1 daqiqa... 🕚")

            const res = await tikTokVideo(m?.text);

            await bot.sendVideo(id, res?.data?.data?.play, {
                caption: res?.data?.data?.title
            })
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

const PORT = 5000;

app.listen(process.env.PORT || PORT, () => {
    console.log('Server running')
})