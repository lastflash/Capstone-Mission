var express = require('express');
var url = require('url');
fs = require('fs');
var app = express();

mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'sensor',
  password: 'rhrod123',
  database: 'data2'
  })
connection.connect();

count=0;

app.get("/getdata",function(req,res){
  var uri = req.url;
  var query = url.parse(uri,true).query;
  var ip = req.ip;
  var split_ip = ip.split(':');
  ip = split_ip[3];
  
  console.log(query.temp);

  if(typeof query.temp!='undefined'){
    var sendmsg = 'Temp : '+query.temp+"\n"+'IP : '+ip;
    res.send(sendmsg);
    console.log('Temp : '+query.temp);
    data={};
    data.seq=count++;
    data.type='T';
    data.device='102';
    data.unit='0';
    data.ip=ip;
    data.value=query.temp;

    fs.appendFile('LOG.txt',query.temp+"\n", function(err){
      if(err) throw err;
    });

    connection.query('INSERT INTO sensors SET ?',data,function(err,rows,cols){
        if(err) throw err;

        console.log('Temperature insert success!');
    });
  }
});

app.get("/dump", function(req, res) {
  console.log("param=" + req.query);

  //var qstr = 'select * from sensors where time > date_sub(now(), INTERVAL 1 DAY) ';
  var qstr = 'select * from sensors';
  connection.query(qstr, function(err, rows, cols) {
    if (err) {
      throw err;
      res.send('query error: '+ qstr);
      return;
    }

    console.log("Got "+ rows.length +" records");
    var html = "<!doctype html><html><body>";
    html += "<H1> Sensor Data for Last 24 Hours</H1>";
    html += "<table border=1 cellpadding=3 cellspacing=0>";
    html += "<tr><td>Seq#<td>Time Stamp<td>Temperature";
    for (var i=0; i< rows.length; i++) {
      html += "<tr><td>"+(i+1)+"<td>"+rows[i].time+"<td>"+rows[i].value;
    }
    html += "</table>";
    html += "</body></html>";
    res.send(html);
  });

});

app.get('/graph', function(req,res){
  console.log('got app.get(graph)');
  var html = fs.readFile('./graph.html',function(err,html){
    if(err) throw err;
    html = " "+html;

    var qstr = 'select * from sensors ';
    connection.query(qstr, function(err, rows, cols){
      if(err) throw err;

      var data = "";
      var comma = "";
      for(var i=0; i< rows.length; i++){
        r = rows[i];
        data += comma + "[new Date("+r.time.getFullYear()+","+r.time.getMonth()+","+r.time.getDate()+","+r.time.getHours()+","+r.time.getMinutes()+","+r.time.getSeconds()+"),"+r.value+"]"
        //data += comma + "[new Date("+date.prototype.getFullYear()+","+date.prototype.getMonth()+","+date.prototype.getDate()+","+date.prototype.getHours+","+date.prototype.getMinutes()+","+date.protytype.getSeconds()+","+r.value+"]";
        comma = ",";
      }
      var header = "data.addColumn('date', 'Date/Time');";
      header += "data.addColumn('number','Temp');";
      html = html.replace("<HEADER>",header);
      html = html.replace("<DATA>",data);

      res.writeHeader(200,{"Content-Type": "text/html"});
      res.write(html);
      res.end();
    })
  })
})

app.listen(3002, function () {
  console.log('Example app listening on port 3002!')
})

