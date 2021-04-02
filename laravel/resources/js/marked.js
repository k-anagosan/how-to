import marked from "marked";
import hljs from "highlightjs";


marked.setOptions({
    breaks: true,
    gfm: true,
    langPrefix: "",
    highlight(code, langWithName) {
        const [lang, name] = langWithName.split(":");
        const highlightCode = hljs.highlightAuto(code, [lang]).value;
        let formattedCode = `${highlightCode}`;
        if (name) {
            formattedCode = `<p class="pre-title"><span>${name}</span></p>${formattedCode}`;
        }
        return formattedCode;
    },
});

export default marked;
