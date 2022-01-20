function decodeDateTag(dateTag) {
    let year = dateTag.toString().slice(4,);
    let month = dateTag.toString().slice(0, 2);
    let date = dateTag.toString().slice(2, 4);

    return new Date(year, month, date);
}
function getDateTag(year, month, date) {
    return ( month >= 10 ? month.toString() : "0" + month.toString() ) + ( date >= 10 ? date.toString() : "0" + date.toString() ) + year.toString();
}