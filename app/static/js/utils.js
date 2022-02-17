function el(elementId) {
    return document.querySelector(elementId);
}
function decodeDateTag(dateTag) {
  let year = dateTag.toString().slice(4,);
  let month = dateTag.toString().slice(0, 2);
  let date = dateTag.toString().slice(2, 4);

  return new Date(year, month, date);
}
function getDateTag(year, month, date) {
  return ( month >= 10 ? month.toString() : "0" + month.toString() ) + ( date >= 10 ? date.toString() : "0" + date.toString() ) + year.toString();
}
function roundToTwo(num) {
    return num.toFixed(2);
}
function monthsBetween(d1, d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth() + 1;
    return Math.abs(months);
}
function merge(left, right) {
    let sortedArr = []; // the sorted elements will go here
  
    while (left.length && right.length) {
      // insert the smallest element to the sortedArr
      if (decodeDateTag(left[0].dateTag) < decodeDateTag(right[0].dateTag)) {
        sortedArr.push(left.shift());
      } else {
        sortedArr.push(right.shift());
      }
    }
  
    // use spread operator and create a new array, combining the three arrays
    return [...sortedArr, ...left, ...right];
}
function mergeSort(arr) {
    const half = arr.length / 2;
  
    // the base case is array length <=1
    if (arr.length <= 1) {
      return arr;
    }
  
    const left = arr.splice(0, half); // the first half of the array
    const right = arr;
    return merge(mergeSort(left), mergeSort(right));
}
async function postTo(url, data) {
  return fetch(url, {method: 'POST', body: JSON.stringify(data), headers: {'Content-Type': 'application/json'}});
}
function randDarkColor() {
  let returnRGB = "rgb(";
  for ( let i = 0; i < 3; i++ ) {
    returnRGB += Math.floor(Math.random() * 50 + 10).toString();
    if ( i < 2 ) returnRGB += ", ";
  }
  returnRGB += ")";
  return returnRGB;
}