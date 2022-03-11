define(() => {
    return {
        parseHtml: (htmlString) => {
            return new DOMParser().parseFromString(htmlString, 'text/html').body.firstElementChild;
        }
    }
})