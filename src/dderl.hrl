-include_lib("imem/include/imem_meta.hrl").

-define(DEFAULT_ROW_SIZE, 100).
-record(viewstate, { table_layout = []
                   , column_layout = []
       }).

-record(ddAdapter,                          %% DDerl adapter (connect to databases)              
                  { id                      :: atom()             %% oci | imem | ets | os_text | dfs_text | hdfs_text
                  , fullName                :: binary()           %% displayed in drop down box
                  }
       ). 
-define(ddAdapter, [atom, binstr]).

-record(ddInterface,                        %% DDerl client interface (connect to ui / applications)               
                  { id                      :: atom()             %% ddjson
                  , fullName                :: binary()           %% displayed in drop down box
                  }
       ).
-define(ddInterface, [atom, binstr]).

-record(ddConn,                             %% DB connection    
                  { id                      ::ddEntityId()       
                  , name                    ::binary()          %% connection name (mutable)
                  , owner                   ::ddEntityId()      %% account.id of creator / owner
                  , adapter                 ::atom()            %% oci | imem | ets | os_text | dfs_text | hdfs_text
                  , access                  ::any()             %% erlang term depending on adapter (e.g. ip+service or tns)
                  , schm                    ::any()             %% erlang term depending on adapter (e.g. name or uri or data root path)
                  }
       ).
-define(ddConn, [integer, binstr, userid, atom, term, term]).
      
-record(ddCmd,                              %% DB command     
                  { id                      ::ddEntityId()       
                  , name                    ::binary()          %% command template name (mutable)
                  , owner                   ::ddEntityId()      %% account.id of creator / owner
                  , adapters                ::[atom()]          %% can be used for this list of ddAdap
                  , conns = local           ::list() | local    %% can be local or a list with remote connections, empty list for all remote connections.
                  , command                 ::binary()          %% erlang term depending on adapter (e.g. SQL text)
                  , opts                    ::any()             %% command options ()
                  }
       ).
-define(ddCmd, [integer, binstr, userid, list, list, binstr, term]).

-record(ddView,                             %% user representation of a db command including rendering parameters
                  { id                      ::ddEntityId()
                  , interface               ::atom()            %% interface plugin (ddjson for now)  
                  , owner                   ::ddEntityId()      %% account.id of creator / owner
                  , name                    ::binary()          %% should default to command name
                  , cmd                     ::ddEntityId()      %% db command id
                  , state                   ::#viewstate{}      %% transparent viewstate (managed by client application)
                  }
       ).
-define(ddView, [integer, atom, userid, binstr, integer, term]).

-record(ddDash,                             %% user representation of a dashboard (collection of views)
                  { id                      ::ddEntityId()
                  , interface               ::atom()            %% interface plugin (ddjson for now)  
                  , owner                   ::ddEntityId()      %% account.id of creator / owner
                  , name                    ::binary()          %% should default to command name
                  , views                   ::list()            %% array of proplists with view layout
                  }
       ).

-define(ddDash, [integer, atom, userid, binstr, list]).


%% Definition taken from imem_seco.hrl
-type ddIdentity()   :: binary().           %% Account name
-type ddCredential() :: {pwdmd5, binary()}. %% {pwdmd5, md5(password)} for now
-type ddPermission() :: atom() | tuple().   %% e.g. manage_accounts, {table,ddDash,select}
-type ddQuota()      :: {atom(),any()}.     %% e.g. {max_memory, 1000000000}

-record(ddAccount,                          %% imem cluster account (shared by application)
                  { id                      ::ddEntityId()
                  , name                    ::ddIdentity()        %% unique login id (mutable)
                  , type='user'             ::atom()              %% user | driver | deamon | application
                  , credentials             ::[ddCredential()]
                  , fullName                ::binary()
                  , lastLoginTime           ::ddDatetime()        %% erlang time of last login success
                  , lastFailureTime         ::ddDatetime()        %% erlang time of last login failure (for existing account name)
                  , lastPasswordChangeTime  ::ddDatetime()        %% change time (undefined or too old  => must change it now and reconnect)
                  , locked='false'          ::'true' | 'false'
                  }
       ).

-define(ddAccount, [userid,binstr,atom,list,binstr,datetime,datetime,datetime,boolean]).

-record(ddRole,                             %% hierarchy of roles with permissions and access privileges to connections and commands  
                  { id                      ::ddEntityId()            %% lookup starts with ddAccount.id, other roles are atoms
                  , roles=[]                ::[atom()]                %% granted roles
                  , permissions=[]          ::[ddPermission()]        %% granted permissions
                  , quotas=[]               ::[ddQuota()]             %% granted quotas
                  }
       ).

-define(ddRole, [userid,list,list,list]).

-ifndef(LOG_TAG).
-define(LOG_TAG, "_DDRL_").
-endif.

-define(NoDbLog(__L,__M,__F,__A),
        lager:__L(__M, "["++?LOG_TAG++"] ~p "++__F, [{?MODULE,?LINE}|__A])).
-define(Log(__L,__M,__F,__A,__S),
(fun(_S) ->
         __Ln = lager_util:level_to_num(__L),
         __LM = __Ln band element(1,lager_config:get(loglevel)),
         _LEn = lager_util:level_to_num(error),
         __ST = if __LM /= 0 andalso length(_S) == 0 andalso __Ln =< _LEn ->
                       erlang:get_stacktrace();
                   true ->
                       _S
                end,
         lager:__L([{stacktrace,__ST}|__M], "["++?LOG_TAG++"] ~p "++__F,
                   [{?MODULE,?LINE}|__A])
 end)(__S)).

-define(Debug(__M,__F,__A),     ?Log(debug,__M,__F,__A,[])).
-define(Info(__M,__F,__A),      ?Log(info,__M,__F,__A,[])).
-define(Error(__M,__F,__A,__S), ?Log(error,__M,__F,__A,__S)).

% helper macro extension
-define(Debug(__F,__A),     ?Debug([],__F,__A)).
-define(Debug(__F),         ?Debug(__F,[])).
-define(Info(__F,__A),      ?Info([],__F,__A)).
-define(Info(__F),          ?Info(__F,[])).
-define(Error(__F,__A,__S), ?Error([],__F,__A,__S)).
-define(Error(__F,__A),     ?Error([],__F,__A,[])).
-define(Error(__F),         ?Error(__F,[])).

% Function shortcuts
-define(Encrypt(__T), dderl:encrypt(__T)).
-define(Decrypt(__S), dderl:decrypt(__S)).

% CSV Export
-define(CSV_FIELD_SEP, ";").

% Config getter
-define(GET_DDERL_CONFIG(__PName,__Context,__Default),
        dderl_dal:get_config_hlk(ddConfig, {dderl,?MODULE,__PName}, ?MODULE,
                                 lists:flatten([__Context,node()]),__Default)
       ).

