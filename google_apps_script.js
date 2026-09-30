function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Order ID", 
        "Timestamp", 
        "Student Name", 
        "Room No", 
        "Phone", 
        "Order Type", 
        "Instructions", 
        "Total Packets",
        "Subtotal",
        "Discount",
        "Delivery Fee",
        "Grand Total",
        "Payment Method",
        "UTR / Ref No",
        "Status",
        "Items Summary"
      ]);
      sheet.getRange(1, 1, 1, 16).setFontWeight("bold");
    }
    
    var itemsSummary = "";
    if (data.items && data.items.length > 0) {
      itemsSummary = data.items.map(function(item) {
        return item.qty + "x " + item.name + " (" + item.variant + ") @ ₹" + item.basePrice;
      }).join("\n");
    }
    
    sheet.appendRow([
      data.orderId || "",
      data.timestamp || new Date().toLocaleString(),
      data.studentName || "",
      data.roomNo || "",
      data.phone || "",
      data.orderType || "",
      data.instructions || "",
      data.totalPackets || 0,
      data.subtotal || 0,
      data.discount || 0,
      data.roomDeliveryFee || 0,
      data.grandTotal || 0,
      data.paymentMethod || "",
      data.utrNo || "",
      data.status || "pending",
      itemsSummary
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({"status": "success", "message": "Order added to Google Sheet"}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    
    var headers = data[0];
    var result = [];
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        obj[headers[j]] = row[j];
      }
      result.push(obj);
    }
    
    // Return latest first
    result.reverse();
    
    return ContentService.createTextOutput(JSON.stringify({"status": "success", "data": result}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
