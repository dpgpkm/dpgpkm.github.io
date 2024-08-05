/**
 * 这个是让 EasyConfig 认为没有保存过配置文件和禁用保存的，调试用，push的时候记得删或者改成false
*/ window.easyconfig_debug = false;


window.mobileCheck = function () {
    let check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};
const keys = easyconfig("keys", {
    'my-keys': [],
    'other-keys': []
});
function openGenerateDialog() {
    ['generate-option-username', 'generate-option-email', 'generate-option-passphrase', 'generate-option-confirm-passphrase'].forEach(cls => {
        mdui.$("." + cls)[0].value = ""
    });
    mdui.$(".generate-errors")[0].innerText = "";
    mdui.$(".generate-option-algo")[0].value = "";
    mdui.$(".generate-option-confirm-passphrase")[0].style.display = "none";
    mdui.$(".generate-key-dialog")[0].open = true;
}

function validateGenerateForm() {
    if (mdui.$(".generate-option-algo")[0].value == "") {
        return "You must choose an algorithm."
    };
    if (mdui.$(".generate-option-email")[0].value != "" && !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(mdui.$(".generate-option-email")[0].value)) { // That's all we needed
        return "Invaild E-Mail address."
    }
    if (mdui.$(".generate-option-passphrase")[0].value != ""
        && mdui.$(".generate-option-passphrase")[0].value != mdui.$(".generate-option-confirm-passphrase")[0].value) {
        return "Passwords not match."
    }
    return null
}

document.querySelector("#javascript-loading-stats").setAttribute("description", "Ready")
document.querySelector("#openpgp-loading-stats").setAttribute("description", `Ready, ${openpgp.config.versionString}`)
document.querySelector('.generate-key-button').onclick = (e) => {
    openGenerateDialog();
}

/**
 * 通过公钥获取用户信息
 * @param {string} publicKeyArmored - 公钥的 Armored 结果
 * @returns {(boolean|Array)} 如果成功，返回一个 [{userID: "",name: "",email: "",comment: "",packets: [],fromStream: false}, ...] 的数组，否则返回 false
 */
async function getPublicKeyInfo(publicKeyArmored) {
    try {
        let publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });
        return [...publicKey.users].map((user) => { return { ...user.userID } });
    } catch (e) {
        return false;
    }
}

/**
 * 解析私钥
 * @param {string} privateKeyArmored - 私钥的 Armored 结果
 * @param {string} passphrase - 私钥的 passphrase （如果有）
 * @returns {key} 如果成功，返回解析后的key对象，否则返回 false
 */
async function readPrivateKey(privateKeyArmored, passphrase = false) {
    try {
        let key = openpgp.readPrivateKey({
            armoredKey: privateKeyArmored
        })
        if (passphrase !== false) {
            key = await openpgp.decryptKey({
                privateKey: key,
                passphrase
            });
        }
        return key;
    } catch (e) {
        return false;
    }
}
function sortKeys() {
    for (keyname in keys) {

        /**
         * 不排序 My-keys
         */if (keyname == "my-keys") return;

        keys[keyname].sort((obj1, obj2) => {
            obj1.nick ??= obj1.userInfos?.[0]?.name ?? obj1.userInfos?.[0]?.userID ?? "(No Name)";
            obj2.nick ??= obj2.userInfos?.[0]?.name ?? obj2.userInfos?.[0]?.userID ?? "(No Name)";
            let a1 = obj1.nick.toUpperCase().charCodeAt(); // 将字母转换为大写以确保不区分大小写
            let a2 = obj2.nick.toUpperCase().charCodeAt();
            if (a1 < a2) return -1;
            if (a1 > a2) return 1;
            return 0;
        });
    }
}

async function generateKey() {
    let error = validateGenerateForm();
    if (error != null) {
        mdui.$('.generate-errors')[0].innerText = error;
    } else {
        // mdui.$('.generate-errors')[0].innerHTML = "You're good to go but that's WIP lol"
        try {
            let keyRule = mdui.$(".generate-option-algo")[0].value.split("-");
            var options = {
                format: 'armored',
                type: keyRule[0],
                userIDs: [{ name: mdui.$(".generate-option-username")[0].value, email: mdui.$(".generate-option-email")[0].value }], //email不提供是空字符串，这里是不是应该加个三元表达式？（""->null） // 空字符串就可以，话说没有开http服务器吗
            };
            if (keyRule[0] == 'rsa') {
                options = {
                    ...options,
                    rsaBits: parseInt(keyRule[1]),
                }
            } else {
                options = {
                    ...options,
                    curve: keyRule[1]
                }
            }
            var xkey = {};
            if (mdui.$(".generate-option-passphrase")[0].value !== "") {
                options.passphrase = xkey.passphrase = mdui.$(".generate-option-passphrase")[0].value;
            }
            const key = await openpgp.generateKey(options);
            xkey = {
                ...xkey,
                ...key
            }
            let userInfos = await getPublicKeyInfo(key.publicKey) || [];
            let _key = {
                ...xkey,
                userInfos,
                nick: (userInfos?.[0]?.name || userInfos?.[0]?.userID || "(No Name)")
            }
            keys["my-keys"].push(_key); // 这里的 push 似乎 Proxy 监听不到

            pushMyKey(_key);
            // 硬核触发 Proxy 方法
            delete keys[""];

            mdui.$(".generate-key-dialog")[0].open = false;
            openKeyGeneratedModal(mdui.$(".generate-option-algo")[0].value, key.publicKey, key.privateKey);
        } catch (err) {
            console.error(err);
            mdui.$('.generate-errors')[0].innerText = `Unable to create keypair: ${err.message || e || "Unknown error"}`;
        }
    }
}
// if(mobileCheck()){
//     document.querySelector("#choice-tab").setAttribute("placement", "bottom")
// }

/**
 * 复制给定的文本到剪贴板。
 * 如果浏览器支持 navigator.clipboard.writeText 方法，则使用异步方法复制文本。
 * 否则，创建一个临时文本框，将文本复制到文本框中，然后执行复制命令。
 * @param {string} text - 要复制的文本内容。
 * @returns {Promise<boolean>} 如果成功复制到剪贴板，则返回 true；否则返回 false。
 */
async function copyText(text) {
    try {
        if (navigator?.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            console.log('Text copied to clipboard successfully!');
        } else {
            let textarea = document.createElement('textarea');
            textarea.value = text;

            document.body.appendChild(textarea);
            textarea.select();
            textarea.setSelectionRange(0, textarea.value.length);

            document.execCommand('copy');
            console.log('Text copied to clipboard successfully!');

            document.body.removeChild(textarea);
        }
        return true;
    } catch (err) {
        console.error('Copy failed: ', err);
        return false;
    }
}

/**
 * 导入keys
 * 注意：导入后会刷新页面
 * @param {string} text - 编码后的keys列表。
 * @returns {boolean} 成功导入返回 true ，导入失败返回 false
 */
function importKey(text, reload = true) {
    try {
        localStorage.setItem("keys", JSON.stringify(JSON.parse(text)));
        location.reload();
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * 导出keys
 * @returns {string<boolean>} 编码后的key内容，如果导出失败返回false
 */
function exportKey() {
    try {
        return JSON.stringify(keys);
    } catch (e) {
        return false;
    }
}


function openKeyGeneratedModal(algo, pub, priv) {
    mdui.$(".generate-success-algorithm")[0].innerText = algo;
    mdui.$(".generate-success-pubkey")[0].onclick = async (e) => {
        if (await copyText(pub)) {
            mdui.alert({
                headline: "Copied!",
                description: "Text copied."
            })
        } else {
            mdui.alert({
                headline: "Copy failed.",
                description: "Failed to copy text. Please try to reload the page."
            })
        }
    }

    mdui.$(".generate-success-privkey")[0].onclick = async (e) => {
        if (await copyText(priv)) {
            mdui.alert({
                headline: "Copied!",
                description: "Text copied."
            })
        } else {
            mdui.alert({
                headline: "Copy failed.",
                description: "Failed to copy text. Please try to reload the page."
            })
        }
    }

    mdui.$(".generate-success-dialog")[0].open = true;
}
async function showKeyInfo(fingerprint) {
    mdui.$(".key-info")[0].open = true;
    // 得到原始key
    async function getKeyFromFingerprint(allKeys, fingerprint) {
        let selKey = null;
        for (let key in allKeys) {
            if (!allKeys[key].fingerprint) {
                allKeys[key].fingerprint = await getPublicKeyFingerprint(allKeys[key].publicKey)
            }
            if (allKeys[key].fingerprint == fingerprint) {
                selKey = allKeys[key];
                break;
            }
        }
        return selKey;
    }
    // 通过浅克隆实现缓存pgp指纹，让查询速度加快
    let selKey = await getKeyFromFingerprint(keys['my-keys'], fingerprint) || await getKeyFromFingerprint(keys['other-keys'], fingerprint) || {};

    console.log(selKey);

    mdui.$(".key-info-change-nick")[0].onclick = () => {
        // TODO：改名弹窗
    }
    mdui.$(".key-info-delete")[0].onclick = () => {
        // TODO：删除功能
    }
    function registerButtonDo(keyinp, classid) {
        if (selKey[keyinp]) {
            mdui.$(classid)[0].onclick = async () => {
                if (await copyText(selKey[keyinp])) {
                    mdui.alert({
                        headline: "Copied!",
                        description: "Text copied."
                    })
                } else {
                    mdui.alert({
                        headline: "Copy failed.",
                        description: "Failed to copy text. Please try to reload the page."
                    })
                }
            }
            mdui.$(classid)[0].style.display = "block";
        } else mdui.$(classid)[0].style.display = "none";
    }

    registerButtonDo("privateKey",".key-info-copy-privkey");
    registerButtonDo("revocationCertificate",".key-info-copy-revoke-cert");
    registerButtonDo("publicKey",".key-info-copy-pubkey");

}
function generateKeySummaryEl(name, email, fingerprint) {
    console.log("Generating Key Summary Element", name, email, fingerprint);
    let root = document.createElement("mdui-list-item");
    root.innerText = name;
    let description_line1 = document.createElement("span");
    description_line1.setAttribute("slot", "description");
    description_line1.innerHTML = email.replaceAll("<", "&lt;").replaceAll(">", "&gt;") + "<br />" + fingerprint.replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    root.appendChild(description_line1)
    root.onclick = (e) => {
        showKeyInfo(fingerprint);
    }
    return root
};
async function getPublicKeyFingerprint(publicKeyArmored) {
    const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });
    const fingerprint = publicKey.getFingerprint();
    return fingerprint;
};
async function pushMyKey(key) {
    mdui.$(".manager-my-keys")[0].appendChild(generateKeySummaryEl(key.nick || "(No Name)", key.userInfos[0].email || "(No E-Mail)", (key.fingerprint || await getPublicKeyFingerprint(key.publicKey))) || "(No Fingerprint)")
}
async function initMyKeys() {
    mdui.$(".manager-my-keys")[0].innerText = '';
    for (let k in keys['my-keys']) {
        await pushMyKey(keys['my-keys'][k])
    }
}

async function initOtherKeys() {
    let key = [...(keys["other-keys"] || [])];
    let bar = mdui.$(".manager-other-keys")[0];
    let sorted = {};

    key.forEach((k) => {
        let name = k.nick.substring(0, 1).toUpperCase();
        if (!/[A-Z]/i.test(name)) name = "#";
        if (!sorted[name]) sorted[name] = [];
        sorted[name].push(k);
    });

    let sortedKeys = Object.keys(sorted).sort();
    let sortedObj = {};
    sortedKeys.forEach(key => {
        sortedObj[key] = sorted[key];
    });

    bar.innerText = '';
    for (let i of sortedKeys) {
        let title = document.createElement("h4");
        title.style.margin = "8px 0px 0px 0px";
        title.innerText = i;
        bar.appendChild(title);
        bar.appendChild(document.createElement("mdui-divider"));
        for (let k of sortedObj[i]) {
            let fingerprint = k.fingerprint || await getPublicKeyFingerprint(k.publicKey);
            let keyBlock = generateKeySummaryEl(k.nick || "(No Name)", k.userInfos[0].email || "(No E-Mail)", fingerprint || "(No Fingerprint)");
            bar.appendChild(keyBlock);
        }
    }

}


initMyKeys();
initOtherKeys();


console.warn("Warning: DO NOT PASTE ANYTHING HERE IF YOU DON'T KNOW WHAT IS THIS.");