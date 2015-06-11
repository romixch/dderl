var adapters = null;
var owners = null;
var connects = null;

function connect_dlg()
{
    var dlg = $('<div>')
    .attr('title', "Connect to Database");

    var connect_common = $('<table>')
    .attr({border: 0, width: '100%', height: '85%', cellpadding: 0, cellspacing: 2})
    .appendTo(dlg);
    
    dlg.append($('<hr>'));

    var connect_options = $('<div>')
    .css({width: '100%', height: '100%'})
    .appendTo(dlg);
    
    var adapter_list = $('<select class="ui-widget-content ui-corner-all">');
    var owners_list = $('<select class="ui-widget-content ui-corner-all">');
    var connection_list = $('<select class="ui-widget-content ui-corner-all">');

    connect_common.append(
        $('<tr>').append(
            $('<td>').attr({align: 'right', valign: 'center'})
                .append("DB Type"),
            $('<td>').attr({valign: 'bottom'})
                .append(adapter_list)
        ),
        $('<tr>').append(
            $('<td>').attr({align: 'right', valign: 'center'})
                .append("Ownership"),
            $('<td>').attr({valign: 'bottom'})
                .append(owners_list)
        ),
        $('<tr>').append(
            $('<td>').attr({align: 'right', valign: 'center'})
                .append("Connection Name"),
            $('<td>').attr({valign: 'bottom'})
                .append(connection_list)
        )
    );
    
    function add_methods(keyVals, defaultSelectedId, fn) {
        var div = $('<div>');
        for(var k in keyVals) {
            div.append(
                $('<input type="radio" id="'+k+'" name="method" value="'+k+'">'+
                  '<label for="'+k+'">'+keyVals[k]+'</label>'));
        }
        
        div
        .appendTo(connect_options)
        .buttonset()
        .change(function() {
            var newconn = {};
            fn({method : $("input:radio[name=method]:checked").val()});
        });
        $('#'+defaultSelectedId).attr("checked", true).button("refresh");
    }
    
    function add_imem_options(connect) {
        connect_options.empty();
        add_methods({local: 'Local', rpc : 'RPC', tcp : 'TCP'},
                    connect.method, add_imem_options);
        
        var options = $('<table>')
        .attr({border: 0, width: '100%', height: '100%', cellpadding: 0, cellspacing: 2})
        .appendTo(connect_options);
        if(connect.method == 'local') {
            options.append(
                $('<tr>').append(
                    $('<td>Schema</td>'),
                    $('<td>').append(
                        $('<input type="text" id="schema">').val(connect.schema)
                    )
                )
            );
        } else if (connect.method == 'rpc') {
            options.append(
                $('<tr>').append(
                    $('<td>Schema</td>'),
                    $('<td>').append(
                        $('<input type="text" id="schema">').val(connect.schema)
                    )
                ),
                $('<tr>').append(
                    $('<td>Node</td>'),
                    $('<td>').append(
                        $('<input type="text" id="node">').val(connect.node)
                    )
                ),
                $('<tr>').append(
                    $('<td>User</td>'),
                    $('<td>').append(
                        $('<input type="text" id="user">').val(connect.user)
                    )
                ),
                $('<tr>').append(
                    $('<td>Password</td>'),
                    $('<td>').append(
                        $('<input type="password" id="password">')
                    )
                )
            );
        } else if (connect.method == 'tcp') {
            options.append(
                $('<tr>').append(
                    $('<td>Schema</td>'),
                    $('<td>').append(
                        $('<input type="text" id="schema">').val(connect.schema)
                    )
                ),
                $('<tr>').append(
                    $('<td>Host / IP</td>'),
                    $('<td>').append(
                        $('<input type="text" id="host">').val(connect.host)
                    )
                ),
                $('<tr>').append(
                    $('<td>Port</td>'),
                    $('<td>').append(
                        $('<input type="text" id="port">').val(connect.port)
                    )
                ),
                $('<tr>').append(
                    $('<td>User</td>'),
                    $('<td>').append(
                        $('<input type="text" id="user">').val(connect.user)
                    )
                ),
                $('<tr>').append(
                    $('<td>Password</td>'),
                    $('<td>').append(
                        $('<input type="password" id="password">')
                    )
                ),
                $('<tr>').append(
                    $('<td>Secure</td>'),
                    $('<td>').append(
                        $('<input type="checkbox" id="secure">').attr('checked', connect.secure)
                    )
                )
            );
        } else {
            throw("Unknown connect method" + connect.method);
        }
    }

    function add_oci_options(connect) {
        connect_options.empty();
        add_methods({tns: 'TNS', service : 'Service', sid : 'SID'},
                    connect.method, add_oci_options);
        var options = $('<table>')
        .attr({border: 0, width: '100%', height: '100%', cellpadding: 0, cellspacing: 2})
        .appendTo(connect_options);
        if(connect.method == 'tns') {
            options.append(
                $('<tr>').append(
                    $('<td>').attr('colspan',2)
                    .append(
                        $('<textarea rows=10 cols=41 id="tns">').val(connect.tns)
                    )
                ),
                $('<tr>').append(
                    $('<td>User</td>'),
                    $('<td>').append(
                        $('<input type="text" id="user">').val(connect.user)
                    )
                ),
                $('<tr>').append(
                    $('<td>Password</td>'),
                    $('<td>').append(
                        $('<input type="password" id="password">')
                    )
                )
            );
        } else if (connect.method == 'service' || connect.method == 'sid') {
            var mthdLbl = $('<td>');
            var mthdVal = $('<td>');

            if(connect.method == 'service') {
                mthdLbl.append("Service");
                mthdVal.append($('<input type="text" id="service">').val(connect.service));
            } else if(connect.method == 'sid') {
                mthdLbl.append("SID");
                mthdVal.append($('<input type="text" id="sid">').val(connect.sid));
            }

            options.append(
                $('<tr>').append(mthdLbl, mthdVal),
                $('<tr>').append(
                    $('<td>Host / IP</td>'),
                    $('<td>').append(
                        $('<input type="text" id="host">').val(connect.host)
                    )
                ),
                $('<tr>').append(
                    $('<td>Port</td>'),
                    $('<td>').append(
                        $('<input type="text" id="port">').val(connect.port)
                    )
                ),
                $('<tr>').append(
                    $('<td>User</td>'),
                    $('<td>').append(
                        $('<input type="text" id="user">').val(connect.user)
                    )
                ),
                $('<tr>').append(
                    $('<td>Password</td>'),
                    $('<td>').append(
                        $('<input type="password" id="password">')
                    )
                )
            );
        } else {
            throw("Unknown connect method" + connect.method);
        }
    }

    function load_connect_option() {
        var connect = connects[connection_list.val()];
        connect_options.empty();
        if(connect.adapter == "imem") {
            add_imem_options(connect);
        } else if (connect.adapter == "oci") {
            add_oci_options(connect);
        }
        connect_options.find("input:text,input:password,textarea")
            .addClass("text ui-widget-content ui-corner-all");
    }

    dlg = dlg.appendTo(document.body)
    .dialog({
        autoOpen: false,
        height: 'auto',
        width: 'auto',
        resizable: false,
        modal: true,
        buttons: {
            'Login / Save': function() {
                var conn = connection_list.find("option:selected").data('connect');
                var conn_name = connection_list.parent().find('input').val();
                if(conn.name != conn_name)
                    conn.id = null;
                conn.name    = conn_name;
                conn.adapter = adapter_list.val();
                conn.owner   = owners_list.parent().find('input').val();
                conn.method  = $("input:radio[name=method]:checked").val();
                if(conn.adapter == 'imem') {
                    if(conn.method == 'local') {
                        conn.schema = $('#schema').val();
                    } else if(conn.method == 'rpc') {
                        conn.schema = $('#schema').val();
                        conn.node = $('#node').val();
                        conn.user = $('#user').val();
                        conn.password = $('#password').val();
                    } else if(conn.method == 'tcp') {
                        conn.schema = $('#schema').val();
                        conn.host = $('#host').val();
                        conn.port = $('#port').val();
                        conn.user = $('#user').val();
                        conn.password = $('#password').val();
                        conn.secure = $('#secure').is(':checked');
                    }
                } else if(conn.adapter == 'oci') {
                    if(conn.method == 'tns') {
                        conn.tns = $('#tns').val();
                        conn.user = $('#user').val();
                        conn.password = $('#password').val();
                    } else if(conn.method == 'service' || conn.method == 'sid') {
                        if(conn.method == 'service') {
                            conn.service = $('#service').val();
                        } else if(conn.method == 'sid') {
                            conn.sid = $('#sid').val();
                        }
                        conn.host = $('#host').val();
                        conn.port = $('#port').val();
                        conn.user = $('#user').val();
                        conn.password = $('#password').val();
                    }
                }

                console.log(conn);
            },
            'Delete': function() {
                console.log('Delete '+ JSON.stringify({id : connection_list.val()}));
            }
        }
    })
    .dialog('open');
    
    adapter_list.change(function() {
        if(adapter_list.children().length < 1) {
            for(var i=0; i < adapters.length; ++i)
                adapter_list.append($('<option>', {
                    value: adapters[i].id,
                    text : adapters[i].fullName 
                }));
                adapter_list.combobox();
        } else {
            connection_list.trigger("adapter_change");
        }
    });

    connection_list
    .on('owner_change adapter_change', function(event) {
        connection_list.empty();
        connection_list.change();        
    })
    .change(function() {
        //dlg.dialog('open');

        if(connection_list.children().length < 1) {

            var adapter = adapter_list.val();
            var owner = owners_list.val();
            var connectsArray = [];

            for(var id = 0; id < connects.length; ++id)
                if(connects[id].adapter == adapter && connects[id].owner == owner)
                    connectsArray.push(
                        {dom    : {value: id, text: connects[id].name},
                         data   : connects[id]});
            
            connectsArray.sort(function(a, b) {
                return a.text == b.text ? 0: a.text < b.text ? -1 : 1;
            });
            
            for(var j = 0; j < connectsArray.length; ++j)
                connection_list.append(
                    $('<option>', connectsArray[j].dom)
                    .data('connect', connectsArray[j].data)
                    );

            connection_list.sort();
            connection_list.combobox();
            connection_list.parent().find('input')
                .val(connection_list.find('option:selected').text());
        }
        load_connect_option();
    });

    owners_list.change(function() {
        if(owners_list.children().length < 1) {
            owners_list.parent().find('input').val('');
            for(var idx = 0; idx < owners.length; ++idx)
                owners_list.append($('<option>', {value: owners[idx], text : owners[idx]}));
            owners_list.combobox();

            // FIXIT: Bad bad hack to remove scrollbar
            owners_list.parent().width(owners_list.next().width() +
                                       owners_list.next().children().last().width());
        } else {
            connection_list.trigger("owner_change");
        }
    });

    // AJAX Simulation
    setTimeout(function() {
        var connect_info = {
            adapters : [{id:"imem", fullName:"IMEM DB"},
                        {id:"oci", fullName:"Oracle/OCI"}],
            connections : [{id     : 1,
                         name   : "imem local", adapter : "imem", owner:"system",
                         method : "local", schema:"sbsgui"},
                        {id     : 2,
                         name:"imem rpc", adapter:"imem", owner:"admin",
                         method:"rpc", schema:"sbsgui", node:"a@host", user:"abc"},
                        {id     : 3,
                         name:"imem tcp", adapter:"imem", owner:"admin",
                         method:"tcp", schema:"sbsgui", host:"1.1.1.1", port:1234,
                         user:"def", secure: false},
                        {id     : 4,
                         name:"oracle tns", adapter:"oci", owner:"admin",
                         method: "tns",
                         tns:"TNS string...", user:"scott"},
                        {id     : 5,
                         name:"oracle service", adapter:"oci", owner:"system",
                         method: "service", service:"xe",
                         host:"localhost", port:1521, user:"scott"},
                        {id     : 6,
                         name:"oracle sid", adapter:"oci", owner:"system",
                         method: "sid", sid:"xe",
                         host:"localhost", port:1521, user:"scott"}]
        };
        adapters = connect_info.adapters;
        connects = connect_info.connections;
        owners = [];
        var ownersUnique = {};
        for(var idx = 0; idx < connects.length; ++idx)
            if(!ownersUnique.hasOwnProperty(connects[idx].owner)) {
                ownersUnique[connects[idx].owner] = true;
                owners.push(connects[idx].owner);
            }

        adapter_list.empty();
        owners_list.empty();
        connection_list.empty();
        
        adapter_list.change();
        owners_list.change();
        connection_list.change();

    }, 1000);
/*/
    ajaxCall(null, 'connect_info', {}, 'connect_info', function(connect_info) {
        adapters = connect_info.adapters;
        connects = connect_info.connections;
        owners = [];
        var ownersUnique = {};
        for(var id in connects)
            if(!ownersUnique.hasOwnProperty(connects[id].owner)) {
                ownersUnique[connects[id].owner] = true;
                owners.push(connects[id].owner);
            }

        adapter_list.empty();
        owners_list.empty();
        connection_list.empty();
        
        adapter_list.change();
        owners_list.change();
        connection_list.change();
    });
//*/
}

