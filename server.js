import { Telegraf } from "telegraf"
import axios from "axios";
import express from "express"
import { config } from "dotenv"

config()
const app = express()
app.use(express.json());
const TOKEN = process.env.TOKEN
const URL = process.env.URL

const bot = new Telegraf(TOKEN)
bot.start((ctx) => ctx.reply(`Assalomu Alaykum ${ctx.message.from.first_name}, men Yuksta. Instagram video havolasini yuboring`))

app.get('/', (req, res) => {
    res.status(200).json({
        holati: 200,
        ishlayati: true
    })
})

setInterval(async() => {
    const res = await axios.get(URL)
    console.log(res)
}, 1000 * 60 * 2)

const download = async (url) => {
    const options = {
        method: 'GET',
        url: 'https://instagram-story-downloader-media-downloader.p.rapidapi.com/index',
        params: { url: url },
        headers: {
            'X-RapidAPI-Key': '9ea5748716msh4cb3f676d47021dp17a992jsn7d30a9b73573',
            'X-RapidAPI-Host': 'instagram-story-downloader-media-downloader.p.rapidapi.com'
        }
    };

    try {
        return await axios.request(options)
    } catch (error) {
        console.log(error)
    }
}

const tikTokVideo = async (e) => {
    const options = {
        method: 'GET',
        url: 'https://tiktok-video-no-watermark2.p.rapidapi.com/',
        params: { url: e, hd: '0' },
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

bot.on('text', async (ctx) => {
    ctx.reply("Hozir 1 daqiqa... 🕚")

    try {
        let album = []
        const text = ctx.message.text

        if (!text.startsWith('https://')) {
            ctx.reply("Iltimos faqat TikTok yoki instagram havolasini kiriting!")
        } else if (text.startsWith('https://www.tiktok.com/')
            || text.startsWith("https://vt.tiktok.com/")) {

            const res = await tikTokVideo(text);

            ctx.replyWithVideo(res?.data?.data?.play, {
                caption: res?.data?.data?.title
            })
        } else {
            const { data } = await download(text)
            const { Type, media, title, media_with_thumb: group } = data
            switch (Type) {
                case "Post-Image":
                    ctx.replyWithPhoto(media, {
                        caption: title
                    })
                    console.log(media)
                    break;

                case "Carousel":
                    group.map((src) => {
                        album.push({
                            media: src.media,
                            type: src.Type === "Image" ? "photo" : "video"
                        })
                        album[0].caption = title
                    })
                    ctx.replyWithMediaGroup(album)
                    break;

                case "Post-Video":
                    ctx.replyWithVideo(media, {
                        caption: title
                    })
                    break;

                case "Story-Video":
                    ctx.replyWithVideo(media)
                    break;

                case "Story-Image":
                    ctx.replyWithPhoto(media)
                    break;
                default:
                    console.log(Type)
                    break;
            }
        }

    }
    catch (err) {
        ctx.reply('Uzr, nimadur xatolik qaytardi :(')
        console.log(err)
    }
})

bot.launch()

const PORT = 5000;

app.listen(process.env.PORT || PORT, () => {
    console.log('Server running')
})