import marked from "marked";
import hljs from "highlightjs";

marked.setOptions({
    breaks: true,
    gfm: true,
    langPrefix: "",
    highlight(code, lang) {
        return hljs.highlightAuto(code, [lang]).value;
    },
});

export default marked;
