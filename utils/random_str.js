export function randomString(e) {    
    e = e || 32;
    var t = "abcdefghijklmnopqrstuvwxyz0123456789",
    a = t.length,
    n = "";
    for (let i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
    return n
}