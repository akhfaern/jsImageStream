const removeipv4header = (ipAddress) => {
    return ipAddress.substr(0, 7) === "::ffff:" ? ipAddress.substr(7) : ipAddress
}

const islocalip = (ipAddress) => {
    return (ipAddress === '::1') ? '127.0.0.1' : ipAddress
}

const fixIp = (ipAddress) => {
    return islocalip(removeipv4header(ipAddress))
}

module.exports = {
    removeipv4header,
    islocalip,
    fixIp
}