
/*  RETURN VALUE :
    * [
    *   {
    *       index (int), start (string), end (string), content (string)
    *   }, 
    *   {...}
    *  ] 
*/
export const srtToJson = (file) => {
    const splited_file = file.split("\n")
    let file_json = []
    let i = 0
    let val
    while (i < splited_file.length && splited_file[i].trim() == "")
            i++
    while (i < splited_file.length) {
        let subtitle = {content: ""}
        val = splited_file[i].trim()
        if (/^\d+$/.test(val)) {
            subtitle.index = parseInt(val)
            i++
        } else {
            return {error: true, message: "Format Error at line " + i + ": expecting subtitle number"}
        }

        val = splited_file[i].trim()
        if (/^(\d{2}:){2}\d{2},\d{3} *--> *(\d{2}:){2}\d{2},\d{3}$/.test(val)) {
            const time = val.split("-->")
            subtitle.start = time[0].trim()
            subtitle.end = time[1].trim()
            i++
        } else {
            return {error: true, message: "Format Error at line " + i + ": expecting time likes 00:00:00,000 --> 00:00:00,000"}
        }

        while ((val = splited_file[i].trim()) != "") {
            if (subtitle.content.length)
                subtitle.content += '\n'
            subtitle.content += val
            i++
        }
        if (subtitle.content.length == 0) {
            return {error: true, message: "Format Error at line " + i + ": text missing"}
        }
        file_json.push(subtitle)

        while (i < splited_file.length && splited_file[i].trim() == "")
            i++
    }
    if (file_json.length == 0) {
        return {error: true, message: "No content in the file"}
    }
    return {error: false, data: file_json}
}

export const jsonToSrt = (file_json) => {
    let fileSrt = []
    file_json.forEach(e => {
        fileSrt.push(
            e.index + '\n' + e.start + ' --> ' + e.end + '\n' + e.content + '\n'
        )
    })
    return (fileSrt.join('\n'))
}

export const highlightRules = (str, rules, words) => {
    str = replaceStr(str)
    function replaceStr(string) {
        return string
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
    }
    const pattern = new RegExp(`(${words.map(e => (e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))).join('|')})`, 'g')
    if (str && rules.length && words.length && pattern.test(str)) {
        const result = str.replace(pattern, match => `<mark title="${rules.find(e => (e.startWord == match)).endWord}">${match}</mark>`);
        return result
    } else {
        return str
    }
}