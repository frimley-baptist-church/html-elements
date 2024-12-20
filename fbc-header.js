(function () {

    // Mobile friendly page
    if (document.querySelectorAll('meta[name=viewport]').length == 0) {
        const m = document.createElement('meta')
        m.name = 'viewport'
        m.content = 'width=device-width, initial-scale=1'
        document.querySelector('head').appendChild(m)
    }

    window.fbc = window.fbc || {}

    // An Event Bus.
    // Used to send messages between distinct components on a page, regardless of component technology used.
    // - https://pineco.de/creating-a-javascript-event-bus/ (general concept)
    // - https://stackoverflow.com/a/34418446/7656091 : private data (bus inside the constructor method), and public methods (also inside the constructor, but prefixed with this.)
    fbc.EventBus = new class {
        constructor() {
            const bus = document.createElement('FBC-EventBus')
            this.addEventListener = function(event, callback) {
                bus.addEventListener(event, callback)
            }
            this.removeEventListener = function(event, callback) {
                bus.removeEventListener(event, callback)
            }
            this.dispatchEvent = function(event, detail = {}) {
                bus.dispatchEvent(new CustomEvent(event, {detail}))
            }
        }
    }

    // Dynamic JS dependency-stack injection - https://stackoverflow.com/a/62969633/7656091
    fbc.addDependentScripts = async function (scriptsToAdd) {
        const s = document.createElement('script')
        for (var i = 0; i < scriptsToAdd.length; i++) {
            let r = await fetch(scriptsToAdd[i])
            s.text += await r.text()
        }
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelector('body').appendChild(s)
        })
    }

    // add selected core files to all pages
    let filesToAdd = []

    // Optional bootstrap. To activate, add this class to the html node: <html class=newslabs-bootstrap> 
    // Here, order is important as BS depends on JQ
    if (document.querySelector('html').classList.contains('use-bootstrap')) {
        filesToAdd.push('https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css')
        filesToAdd.push('https://code.jquery.com/jquery-3.5.1.slim.min.js')
        filesToAdd.push('https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min.js')
    }

    // Our own additions. css and js files are supported, creating <link rel=stylesheet> or <script> as appropriate.
    filesToAdd.push('https://frimley-baptist-church.github.io/html-elements/core.css')

    let jsToAdd = []

    const firstCSSNode = document.querySelector('link[rel=stylesheet]')
    let firstCSS = false

    filesToAdd.forEach(url => {
        let n = -1
        let x = url.split('.')
        let ext = x[x.length - 1]
        if (ext == 'css') n = document.querySelectorAll('link[href*="' + url + '"]').length
        if (ext == 'js') n = document.querySelectorAll('script[src*="' + url + '"]').length
        if (n == 0) {
            let e = null
            if (ext == 'css') {
                e = document.createElement('link')
                e.rel = 'stylesheet'
                e.href = url
                if (firstCSS === false) {
                    if (firstCSSNode !== null) {
                        firstCSS = firstCSSNode.parentNode.insertBefore(e, firstCSSNode)
                    } else {
                        firstCSS = document.querySelector('head').appendChild(e)
                    }
                } else {
                    firstCSS.after(e)
                }
            }
            if (ext == 'js') {
                jsToAdd.push(url)
            }
        }
    })

    fbc.addDependentScripts(jsToAdd)
})()

customElements.define(
    'fbc-header',
    class extends HTMLElement
{
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
<style>
@import "https://frimley-baptist-church.github.io/html-elements/core.css";
:host(fbc-header) {
    position: fixed;
    width: 100%;
    top: 0px;
    z-index: 999999;
}
div.outer{
    display: flex;
    height: 40px;
    line-height: 40px;
    border-bottom: 1px solid silver;
    background: #fff;
    font-size: 20px;
    color: #404040;
}
div.outer div{
    white-space: nowrap;
}
#blocks{
    width: 94px;
    min-width: 94px;
    text-align: center;
    border-right: 1px solid silver;
    position: relative;
}
#blocks svg{
    position: absolute;
    left: 11px;
    top: 4px;
    width: 72px;
}
#app{
    padding: 0px 12px;
    border-right: 1px solid silver;
    font-weight: bold;
    overflow: hidden;
}
#app:empty{
    display: none;
}
div.outer[applink] #app:hover{
    background: linear-gradient(0deg, var(--fbc-blue) 4px, transparent 0px);
    cursor: pointer;
}
#subtitle{
    padding: 0px 12px;
    flex-grow: 1;
    font-size: 18px;
    font-weight: 400;
    overflow: hidden;
}
#userinfo{
    font-size: 15px;
    font-weight: 100;
    padding: 0px 10px;
    border-left: 1px solid silver;
    display: none;
}
#userinfo svg{
    margin-top: 10px;
    vertical-align: top;
    margin-right: 10px;
}
@media screen and (max-width: 490px) {
    #userid{
        display: none !important;
    }
    #userinfo svg{
        padding-right: 0px;
    }
}
div.proto{
    display: none;
    padding: 22px 0em 0em;
    background: var(--fbc-blue);
    color: white;
    font-weight: bold;
    transform: rotate(-45deg);
    transform-origin: bottom right;
    width: 7em;
    top: -13px;
    position: absolute;
    left: -37px;
    text-align: center;
    z-index: -1;
    height: 50px;
    font-family: sans-serif;
}
#help{
    padding: 10px 11px 0;
    cursor: pointer;
    border-left: 1px solid silver;
    display: none;
}
#help[active]{
    display: unset;
}
#help:hover{
    background-color: var(--fbc-blue);
}
#help[active][text]{
    padding-top: 0px;
    font-size: 18px;
}
#help[active][text] svg{
    display: none;
}
#help[active][text]:before{
    content: attr(text);
}
#help[active][text]:hover{
    color: white;
}
#blocks{
    width: 2em;
    min-width: unset;
}
#blocks>img{
    height: 80%;
    margin: 10% auto;
}
</style>
<div class=outer>
<div id=blocks class=inner>
<img alt=logo width=31 src=//openlp.fbc.org.uk/ico/fbc-logo.svg>
<!--
<svg viewBox="0 0 84 24"xmlns="http://www.w3.org/2000/svg" aria-label="BBC logo" height="32px" width="32px" class="gel-icon gel-icon--legacy_blocks bbc-blocks--image"><path d="M84 0v24H60V0h24ZM54 0v24H30V0h24ZM24 0v24H0V0h24Zm49.102 5.106c-1.08 0-2.055.16-2.925.481a6.294 6.294 0 0 0-2.239 1.388 6.067 6.067 0 0 0-1.43 2.175c-.33.845-.495 1.792-.495 2.84 0 1.074.16 2.04.477 2.897a5.897 5.897 0 0 0 1.372 2.175c.597.592 1.327 1.045 2.191 1.36.864.314 1.836.472 2.916.472.812 0 1.588-.09 2.324-.269a7.832 7.832 0 0 0 1.944-.73v-2.573a7.234 7.234 0 0 1-3.868 1.092c-.915 0-1.693-.173-2.334-.518a3.45 3.45 0 0 1-1.468-1.509c-.336-.66-.505-1.458-.505-2.396s.175-1.734.524-2.388a3.55 3.55 0 0 1 1.506-1.499c.654-.345 1.445-.518 2.372-.518.673 0 1.315.09 1.925.268.61.18 1.175.442 1.696.787V6.013a7.892 7.892 0 0 0-1.858-.675 9.418 9.418 0 0 0-2.125-.232Zm-31.286.144H36.75v13.5h5.379c1.064 0 1.976-.157 2.735-.472.758-.315 1.343-.762 1.753-1.34.41-.58.615-1.272.615-2.078 0-.818-.211-1.513-.634-2.086-.422-.573-1.03-.991-1.826-1.256.575-.276 1.01-.65 1.303-1.123.294-.472.44-1.029.44-1.67 0-1.121-.41-1.98-1.23-2.578-.82-.598-1.976-.897-3.469-.897Zm-30 0H6.75v13.5h5.379c1.064 0 1.976-.157 2.735-.472.758-.315 1.343-.762 1.753-1.34.41-.58.615-1.272.615-2.078 0-.818-.211-1.513-.634-2.086-.422-.573-1.03-.991-1.826-1.256.575-.276 1.01-.65 1.303-1.123.294-.472.44-1.029.44-1.67 0-1.121-.41-1.98-1.23-2.578-.82-.598-1.976-.897-3.469-.897Zm30.092 7.666c1.677 0 2.515.617 2.515 1.85 0 .58-.22 1.023-.66 1.331-.441.309-1.072.463-1.891.463h-2.387v-3.644h2.423Zm-30 0c1.677 0 2.515.617 2.515 1.85 0 .58-.22 1.023-.66 1.331-.441.309-1.072.463-1.891.463H9.485v-3.644h2.423ZM41.56 7.44c1.457 0 2.185.535 2.185 1.605 0 .554-.187.985-.56 1.293-.373.309-.915.463-1.625.463h-2.074v-3.36h2.074Zm-30 0c1.457 0 2.185.535 2.185 1.605 0 .554-.187.985-.56 1.293-.373.309-.915.463-1.625.463H9.485v-3.36h2.074Z"></path></svg>
-->
</div>
<div id=app class=inner>${this.app}</div>
<div id=subtitle class=inner><span></span><slot name="buttons"></slot></div>
<div id=help title="Help" class=inner>
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
	<title>
		help
	</title>
    <circle cx="10" cy="10" r="8" fill="white"></circle>
	<path d="M10 0a10 10 0 1 0 10 10A10 10 0 0 0 10 0zm1 16H9v-2h2zm2.71-7.6a2.63 2.63 0 0 1-.34.74 3.06 3.06 0 0 1-.48.55l-.54.48c-.21.18-.41.35-.59.52a3 3 0 0 0-.47.56A2.49 2.49 0 0 0 11 12a4.12 4.12 0 0 0-.11 1H9.08a8.68 8.68 0 0 1 .08-1.25 3.54 3.54 0 0 1 .24-.9 2.81 2.81 0 0 1 .41-.68 4.63 4.63 0 0 1 .58-.58l.51-.44a3 3 0 0 0 .44-.45 1.92 1.92 0 0 0 .3-.54 2.13 2.13 0 0 0 .11-.72 1.94 1.94 0 0 0-.18-.86 1.79 1.79 0 0 0-.43-.58 1.69 1.69 0 0 0-.54-.32 1.55 1.55 0 0 0-.5-.1 1.77 1.77 0 0 0-1.53.68 3 3 0 0 0-.49 1.82H6.16a4.84 4.84 0 0 1 .28-1.68 3.57 3.57 0 0 1 .8-1.29 3.62 3.62 0 0 1 1.27-.83A4.52 4.52 0 0 1 10.18 4a4.42 4.42 0 0 1 1.43.23 3.48 3.48 0 0 1 1.16.65 3 3 0 0 1 .78 1.06 3.49 3.49 0 0 1 .28 1.44 3.63 3.63 0 0 1-.12 1.02z"/>
</svg>
</div>
<div id=userinfo class=inner>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" height="20px" viewBox="0 0 32 32" xml:space="preserve">
<circle cx="16" cy="16" r="6.1"></circle><path d="M16 0a16 16 0 0 0 0 32 16.1 16.1 0 0 0 8.6-2.7L22.1 24H9.9l-1.6 3.5A13.8 13.8 0 0 1 2 15.9a14 14 0 1 1 23.9 10l.9 1.9A16 16 0 0 0 16 0z"></path>
</svg><span id="userid"></span>
</div>
</div>
<div class="proto">BETA</div>
`
    }

    fetchError(resp) {
        if (!resp.ok) {
            throw Error(resp.statusText)
        }
        return resp
    }

    get parent() {
	return this.getRootNode().host
    }
	
    connectedCallback() {
        if (this.hasAttribute('help')) {
            this._helpon()
        }
        if (this.hasAttribute('beta')) {
            this.shadowRoot.querySelector('.proto').style.display='inline-block'
        }
    }

    _helpon() {
        if (this.help.length < 3) return
        const h = this.shadowRoot.getElementById('help')
        h.setAttribute('active', 'active')
        h.addEventListener('click', evt => {
            if (this.help[0] == '#') {
                window.location.hash = this.help
            }
            else {
                window.location.href = this.help
            }
        })
        if (!this.helptext || this.helptext.length < 1) return
        h.setAttribute('text', this.helptext)
    }

    attributeChangedCallback(name, oldvalue, newvalue) {
        if (oldvalue != newvalue) {
            if (name == 'applink') {
                const app = this.shadowRoot.querySelector('#app')
                app.setAttribute('title', 'Open ' + newvalue)
                app.addEventListener('click', evt => {
                    window.location.href = newvalue
                })
                this.shadowRoot.querySelector('div.outer').setAttribute(name, name)
            } else if (name == 'app') {
                this.shadowRoot.getElementById('app').innerHTML = this.app
            } else if (name.slice(0,4) == 'help') {
                _helpon()
            } else {
                const node = this.shadowRoot.querySelector(`#${name} span`)
                if (name != 'userinfo' && typeof (node) !== "undefined") node.innerHTML = newvalue
            }
            if (name == 'userid') {
                this.shadowRoot.getElementById('userinfo').style.display = 'inline-block'
            }
            if (name == 'userinfo') {
                this.shadowRoot.getElementById('userinfo').setAttribute('title', newvalue)
            }
        }
    }

    get app() {
        let app, meta
        if ((app=this.getAttribute('app'))) return app
        if ((meta=document.querySelector('meta[name=application-name]')) && (app=meta.getAttribute('content'))) return app
        return ""
    }

    set app(v) { this.setAttribute('app', v) }

    get applink() { return this.getAttribute('applink') }
    set applink(v) { this.setAttribute('applink', v) }

    get userid() { return this.getAttribute('userid') }
    set userid(v) { this.setAttribute('userid', v) }

    get userinfo() { return this.getAttribute('userinfo') }
    set userinfo(v) { this.setAttribute('userinfo', v) }

    get subtitle() { return this.getAttribute('subtitle') }
    set subtitle(v) { this.setAttribute('subtitle', v) }

    get help() { return this.getAttribute('help') }
    set help(v) { this.setAttribute('help', v) }

    get helptext() { return this.getAttribute('helptext') }
    set helptext(v) { this.setAttribute('helptext', v) }

    static get observedAttributes() {
        return [
            'app',
            'applink',
            'subtitle',
            'userid',
            'userinfo',
        ]
    }
})
