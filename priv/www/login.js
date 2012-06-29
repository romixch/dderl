function display_login()
{
    $('<div id="dialog-login" title="Login to Oracle Database" style="diaply:none">' +
      '  <table border=0 width=100% height=85% cellpadding=0 cellspacing=0>' +
      '      <tr><td align=right valign=center>Connections&nbsp;</td>' +
      '          <td valign=center><select id="config_list" class="ui-corner-all"/></td></tr>' +
      '      <tr><td colspan=2><hr></td></tr>' +
      '      <tr><td align=right valign=center>Connection Name&nbsp;</td>' +
      '          <td valign=bottom><input type="text" id="name" class="text ui-widget-content ui-corner-all"/></td></tr>' +
      '      <tr><td align=right valign=center>IP Address&nbsp;</td>' +
      '          <td valign=bottom><input type="text" id="ip" class="text ui-widget-content ui-corner-all"/></td></tr>' +
      '      <tr><td align=right valign=center>DB Port&nbsp;</td>' +
      '          <td valign=bottom><input type="text" id="port" class="text ui-widget-content ui-corner-all"/></td></tr>' +
      '      <tr><td align=right valign=center>DB&nbsp;</td>' +
      '          <td valign=bottom><input type="text" id="service" class="text ui-widget-content ui-corner-all"/></td></tr>' +
      '      <tr><td align=right valign=center>DB Type&nbsp;</td>' +
      '          <td valign=center><table border=0 cellpadding=0 cellspacing=0>' +
      '              <tr><td valign=center><input type="radio" name="db_type" value="service" checked></td>' +
      '                  <td valign=center>&nbsp;Service&nbsp;&nbsp;</td>' +
      '                  <td valign=center><input type="radio" name="db_type" value="sid"></td>' +
      '                  <td valign=center>&nbsp;SID</td></tr></table>' +
      '          </td></tr>' +
      '      <tr><td align=right valign=center>Username&nbsp;</td>' +
      '          <td valign=bottom><input type="text" id="user" class="text ui-widget-content ui-corner-all"/></td></tr>' +
      '      <tr><td align=right valign=center>Password&nbsp;</td>' +
      '          <td valign=bottom><input type="password" id="password" class="text ui-widget-content ui-corner-all"/></td></tr>' +
      '  </table>' +
      '  <p class="validateTips">* All fields are mandatory</p>' +
      '</div>').appendTo(document.body);

    var name        = $("#name");
    var ip          = $("#ip");
    var port        = $("#port");
    var service     = $("#service");
    var user        = $("#user");
    var password    = $("#password");

    var allFields   = $([]).add(ip).add(port).add(service).add(user).add(password);
    var tips = $(".validateTips");

    $("#dialog-login").dialog({
        autoOpen: false,
        height: 400,
        width: 300,
        //resizable: false,
        modal: true,
        close: function() {
            $("#dialog-login").dialog('destroy');
            $("#dialog-login").remove();
            $("#login-button").css("color", "rgb(255, 255, 255)");
        },
        buttons: {
            "Save": function() {
                saveSettings = {name     :$("#name").val(),
                                ip       :$("#ip").val(),
                                port     :$("#port").val(),
                                service  :$("#service").val(),
                                type     :$('input:radio[name=db_type]:checked').val(),
                                user     :$("#user").val(),
                                password :$("#password").val()};
                var lidx=0;
                for(lidx=0; lidx < logins.length; ++lidx) {
                    if(logins[lidx].name == saveSettings.name) {
                        logins[lidx] = saveSettings;
                        break;
                    }
                }
                if (lidx >= logins.length) {
                    logins[lidx] = saveSettings;
                    $('<option value="'+lidx+'">'+logins[lidx].name+'</option>').appendTo($('#config_list'));
                }

                ajax_post('/app/save', logins, null, null, function(data) {
                    alert(data.result);
                });
            },
            "Login": function() {
                var bValid = true;
                allFields.removeClass( "ui-state-error" );

                bValid = bValid && checkLength( ip, "IP address", 7, 15 );
                bValid = bValid && checkLength( port, "port", 1, 5 );
                bValid = bValid && checkLength( service, "service", 0, 100 );
                bValid = bValid && checkLength( user, "user name", 1, 100 );
                bValid = bValid && checkLength( password, "password", 5, 16 );

                if ( bValid ) {
                    var loginJson = {login: { ip        :ip.val(),
                                              port      :port.val(),
                                              service   :service.val(),
                                              type      :$('input:radio[name=db_type]:checked').val(),
                                              user      :user.val(),
                                              password  :password.val()}
                                    };
                    owner = user.val();
                    ajax_post('/app/login', loginJson, null, null, function(data) {
                        $("#db-tables-views").dynatree();
                        ajax_post('/app/users', null, null, null, function(data) {
                            var usr = '';
                            var userRows = data.rows;
                            for(var i = 0; i < userRows.length; ++i) {
                                    usr = userRows[i][0];
                                    $('<option value="'+usr+'" '+(usr==owner?"selected":"")+'>'+usr+'</option>').appendTo($('#users'));
                            }
                            generate_tables_views(session, owner);
                        })
                    });
                    $(this).dialog("close");
                    show_tables();
                }
            },
            Cancel: function() {
                $(this).dialog("close");
            }
        },
    });
    $('#config_list').html('');
    for(var i=0;i<logins.length; ++i)
        $('<option value="'+i+'">'+logins[i].name+'</option>').appendTo($('#config_list'));
    $('#config_list').change(function() {
        document.title = pageTitlePrefix + $(this).val();
        load_login_form($(this).val());
    });
    load_login_form(1);
    $('#dialog-login').dialog("open");
}

function updateTips(t) {
    tips
        .text(t)
        .addClass("ui-state-highlight");
    setTimeout(function() {
        tips.removeClass( "ui-state-highlight", 1500 );
    }, 500 );
}

function checkLength( o, n, min, max ) {
    if ( o.val().length > max || o.val().length < min ) {
        o.addClass( "ui-state-error" );
        updateTips( "Length of " + n + " must be between " +
            min + " and " + max + "." );
        return false;
    } else {
        return true;
    }
}

function load_login_form(systemid) {
    $('#name').val(logins[systemid].name);
    $('#ip').val(logins[systemid].ip);
    $('#port').val(logins[systemid].port);
    $('#service').val(logins[systemid].service);
    $('#sid').val(logins[systemid].sid);
    $('#user').val(logins[systemid].user);
    $('#password').val(logins[systemid].password);
    $('input:radio[name=db_type][value='+logins[systemid].type+']').click();
    $('#config_list option[value="'+systemid+'"]').attr("selected","selected"); 
}
