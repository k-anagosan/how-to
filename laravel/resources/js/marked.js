import marked from "marked";
import hljs from "highlight.js";

marked.setOptions({
    breaks: true,
    gfm: true,
    langPrefix: "",
    highlight(code, langWithName) {
        const [lang, name] = langWithName.split(":");
        const highlightCode = hljs.highlightAuto(code, [lang]).value;
        let formattedCode = `${highlightCode}`;
        if (name) {
            formattedCode = `<p class="pre-title named"><span>${name}</span></p>${formattedCode}`;
        } else {
            formattedCode = `<div class="pre-title nameless"><span></span></div>${formattedCode}`;
        }
        return formattedCode;
    },
});

export default marked;
