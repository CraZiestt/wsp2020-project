function validate_name(name) {
    if (!name || name.length < 2)
        return 'Error: min 2 chars'
    else
        return null
}

function validate_summary(summary) {
    if (!summary || summary.length < 2)
        return 'Error: min 2 chars'
    else
        return null
}

function validate_price(price) {
    if (!parseFloat(price))
        return `Error: Invalid price value ${price}`
    else
        return null
}