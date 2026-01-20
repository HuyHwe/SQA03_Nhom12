create type dblink_pkey_results as
(
    position integer,
    colname  text
);

alter type dblink_pkey_results owner to admin;

create table if not exists test_from_intellij
(
    id integer
);

alter table test_from_intellij
    owner to admin;

create table if not exists account
(
    id            bigserial
        primary key,
    address       varchar(255),
    city          varchar(255),
    country       varchar(255),
    creation_date timestamp,
    district      varchar(255),
    dob           timestamp,
    email         varchar(255),
    gender        varchar(255),
    nationality   varchar(255),
    password      varchar(255),
    phone_number  varchar(255),
    total_sgpt    integer,
    update_date   timestamp,
    ward          varchar(255),
    role_id       bigint not null,
    creationdate  timestamp with time zone,
    updatedate    timestamp with time zone
);

alter table account
    owner to admin;

create table if not exists candidatemanagement
(
    id           bigserial
        primary key,
    userid       bigint not null,
    jobid        bigint not null,
    status       varchar(255),
    note         varchar(255),
    creationdate timestamp with time zone,
    updatedate   timestamp with time zone,
    ratingstar   integer,
    comment      varchar(255),
    active       integer
);

alter table candidatemanagement
    owner to admin;

create table if not exists chat_log
(
    id               bigserial
        primary key,
    sender           bigserial,
    message          varchar,
    time_send        timestamp,
    is_customer_send boolean,
    creationdate     timestamp with time zone,
    updatedate       timestamp with time zone
);

alter table chat_log
    owner to admin;

create table if not exists coordinates
(
    id           integer not null
        primary key,
    name         varchar(155),
    provincecode boolean,
    lat          double precision,
    lng          double precision,
    createdat    timestamp with time zone,
    updatedat    timestamp with time zone,
    createdby    jsonb,
    createat     timestamp,
    provider     jsonb,
    updateat     timestamp,
    creationdate timestamp with time zone,
    updatedate   timestamp with time zone
);

alter table coordinates
    owner to admin;

create table if not exists district
(
    id           integer not null
        primary key,
    name         varchar(155),
    code         varchar(100),
    provincecode varchar(100),
    isactive     boolean,
    createdat    timestamp with time zone,
    updatedat    timestamp with time zone,
    createdby    jsonb,
    districtcode varchar(255),
    creationdate timestamp with time zone,
    updatedate   timestamp with time zone,
    lat          double precision,
    lng          double precision
);

alter table district
    owner to admin;

create table if not exists flyway_schema_history
(
    installed_rank integer                 not null
        constraint flyway_schema_history_pk
            primary key,
    version        varchar(50),
    description    varchar(200)            not null,
    type           varchar(20)             not null,
    script         varchar(1000)           not null,
    checksum       integer,
    installed_by   varchar(100)            not null,
    installed_on   timestamp default now() not null,
    execution_time integer                 not null,
    success        boolean                 not null
);

alter table flyway_schema_history
    owner to admin;

create index if not exists flyway_schema_history_s_idx
    on flyway_schema_history (success);

create table if not exists freelancer
(
    id              bigserial
        primary key,
    userid          bigint,
    name            varchar(255),
    job             varchar(255),
    birthyear       varchar(255),
    gender          varchar(255),
    des             text,
    address         varchar(255),
    lat             double precision,
    lon             double precision,
    cv              varchar(255),
    active          integer,
    workingtype     varchar(255),
    status          integer,
    img             varchar(255),
    phone           varchar(255),
    email           varchar(255),
    ratingavr       integer,
    creationdate    timestamp with time zone,
    updatedate      timestamp with time zone,
    salary          varchar(200),
    experiencelevel integer,
    skilllevel      integer,
    jobdefaultid    bigint,
    skilldes        varchar(255),
    experiencedes   varchar(255),
    province        varchar(255),
    district        varchar(255),
    ward            varchar(255),
    jobtarget       varchar
);

alter table freelancer
    owner to admin;

create table if not exists job
(
    id                      bigserial
        primary key,
    userid                  bigint           not null,
    name                    varchar(255),
    job                     varchar(255),
    birthyear               varchar(255),
    gender                  varchar(255),
    lat                     double precision not null,
    lon                     double precision not null,
    phone                   varchar(255),
    email                   varchar(255),
    number                  integer,
    address                 varchar(255),
    des                     text,
    cv                      varchar(255),
    active                  integer,
    level                   integer,
    img                     varchar(255),
    website                 varchar(255),
    type                    varchar(255),
    creationdate            timestamp with time zone,
    updatedate              timestamp with time zone,
    salary                  varchar(200),
    expdate                 date,
    requiredexperiencelevel integer,
    requiredskilllevel      integer,
    profit                  varchar(255),
    requiredskill           varchar(255),
    province                varchar(255),
    district                varchar(255),
    ward                    varchar(255),
    jobdefaultid            bigint,
    workingtype             integer,
    organizationid          bigint
);

alter table job
    owner to admin;

create table if not exists jobdefault
(
    id           bigserial
        primary key,
    des          text,
    name         varchar(255),
    parentid     bigint,
    creationdate timestamp with time zone,
    updatedate   timestamp with time zone,
    icon         text,
    active       integer
);

alter table jobdefault
    owner to admin;

create table if not exists messages
(
    id           bigserial
        primary key,
    name         varchar(255),
    ke           varchar(255),
    kefullname   varchar(255),
    namefullname varchar(255),
    avatar       varchar(255),
    messages     varchar(255),
    image        varchar(255),
    type         varchar(255),
    markread     integer                  not null,
    creationdate timestamp with time zone not null,
    updatedate   timestamp with time zone not null
);

alter table messages
    owner to admin;

create table if not exists orders
(
    id                  bigserial
        primary key,
    amount              integer not null,
    des                 varchar(255),
    ipaddr              varchar(255),
    useragent           varchar(255),
    vnp_transactionno   bigint,
    vnp_txnresponsecode varchar(255),
    vnp_message         varchar(255),
    vnp_batchno         integer,
    vnp_bankcode        varchar(255),
    status              varchar(255),
    vnp_paydate         date,
    creationdate        timestamp with time zone,
    updatedate          timestamp with time zone
);

alter table orders
    owner to admin;

create table if not exists organization
(
    id           bigserial
        primary key,
    name         varchar,
    des          varchar,
    creationdate timestamp with time zone,
    updatedate   timestamp with time zone,
    active       integer
);

alter table organization
    owner to admin;

create table if not exists organizationmanagement
(
    id             bigint not null
        primary key,
    usercommonid   bigint,
    organizationid bigint,
    creationdate   timestamp with time zone,
    updatedate     timestamp with time zone
);

alter table organizationmanagement
    owner to admin;

create table if not exists package
(
    type         integer not null,
    price        double precision,
    creationdate timestamp with time zone,
    updatedate   timestamp with time zone,
    id           bigserial
        primary key
);

alter table package
    owner to admin;

create table if not exists payment
(
    id              bigserial
        primary key,
    userid          bigint not null,
    jobid           bigint not null,
    freelancerid    bigint not null,
    note            varchar(255),
    creationdate    timestamp with time zone,
    updatedate      timestamp with time zone,
    totalmoney      bigint,
    transfertype    varchar(255),
    transferedmoney bigint,
    transferedpoint bigint,
    actionname      varchar(255),
    active          integer
);

alter table payment
    owner to admin;

create table if not exists project
(
    id            bigserial
        primary key,
    creation_date timestamp,
    description   varchar(255),
    name          varchar(255),
    note          varchar(255),
    status        integer,
    update_date   timestamp,
    user_id       bigint,
    creationdate  timestamp with time zone,
    updatedate    timestamp with time zone
);

alter table project
    owner to admin;

create table if not exists province
(
    id        integer not null
        primary key,
    name      varchar(155),
    code      varchar(100),
    providers jsonb[],
    isactive  boolean,
    createdat timestamp with time zone,
    updatedat timestamp with time zone,
    createdby jsonb,
    lat       double precision,
    lng       double precision
);

alter table province
    owner to admin;

create table if not exists recruitermanagement
(
    id           bigserial
        primary key,
    userid       bigint not null,
    freelancerid bigint not null,
    status       varchar(255),
    note         varchar(255),
    ratingstar   integer,
    creationdate timestamp with time zone,
    updatedate   timestamp with time zone,
    comment      varchar(255),
    active       integer
);

alter table recruitermanagement
    owner to admin;

create table if not exists requestwithdrawing
(
    id             bigserial
        primary key,
    bonuspoint     double precision not null,
    conversionrate double precision not null,
    receivemoney   double precision not null,
    phone          varchar(255),
    bankaccount    varchar(255),
    status         varchar(255),
    otherreason    varchar(255),
    creationdate   timestamp with time zone,
    updatedate     timestamp with time zone,
    userid         bigint
);

alter table requestwithdrawing
    owner to admin;

create table if not exists role
(
    id            bigserial
        primary key,
    creation_date timestamp,
    description   varchar(255),
    name          varchar(255),
    type          integer,
    update_date   timestamp,
    creationdate  timestamp with time zone,
    updatedate    timestamp with time zone
);

alter table role
    owner to admin;

create table if not exists schedule
(
    id               bigserial
        primary key,
    jobid            bigint not null,
    freelancerid     bigint not null,
    status           varchar(255),
    creationdate     timestamp with time zone,
    updatedate       timestamp with time zone,
    jobstatus        varchar(255),
    freelancerstatus varchar(255),
    startdate        timestamp with time zone,
    enddate          timestamp with time zone,
    topic            varchar(255),
    des              varchar(255),
    type             integer,
    address          varchar(255),
    interviewresult  varchar(10),
    feedback         varchar(255),
    active           integer
);

alter table schedule
    owner to admin;

create table if not exists searchingsuggestion
(
    id           bigserial
        primary key,
    val          text    not null,
    rank         integer not null,
    object       varchar(10),
    creationdate timestamp with time zone,
    updatedate   timestamp with time zone
);

alter table searchingsuggestion
    owner to admin;

create table if not exists settings
(
    id           bigserial
        primary key,
    keywords     varchar(255),
    data         varchar(255),
    updatedate   timestamp with time zone,
    creationdate timestamp with time zone
);

alter table settings
    owner to admin;

create table if not exists transactionhistory
(
    id               bigserial
        primary key,
    userid           bigint not null,
    creationdate     timestamp with time zone,
    updatedate       timestamp with time zone,
    conversionrate   double precision,
    transferredmoney double precision,
    transferredpoint double precision,
    otherreason      varchar(255),
    note             varchar(255),
    transfertype     integer,
    active           integer
);

alter table transactionhistory
    owner to admin;

create table if not exists usercommon
(
    id             bigserial
        primary key,
    phone          varchar(255),
    pin            varchar(255),
    status         varchar(255),
    totalmoney     double precision,
    rating         bigint,
    role           integer,
    loginnumber    bigint,
    withdrawnumber integer,
    introphone     varchar(255),
    bonuspoint     double precision,
    email          varchar(255),
    avatar         varchar(255),
    sentpassword   integer,
    facebookid     varchar(200),
    googleid       varchar(255),
    receiveinfo    integer,
    sendsmsnumber  integer,
    creationdate   timestamp with time zone,
    updatedate     timestamp with time zone,
    premiumexpdate date,
    name           varchar(255),
    gender         varchar(255),
    address        varchar(255),
    jobtarget      varchar(255),
    experience     varchar(255),
    dateofbirth    date,
    country        varchar(255),
    nationality    varchar(255),
    detailaddress  varchar,
    province       varchar(255),
    district       varchar(255),
    ward           varchar(255),
    organizationid bigint,
    packageid      bigint,
    active         integer
);

alter table usercommon
    owner to admin;

create table if not exists users
(
    id           bigserial,
    ke           integer,
    name         varchar(255),
    avatar       varchar(255),
    login        varchar(255),
    status       varchar(255),
    sms          integer,
    fullname     varchar(255),
    creationdate timestamp with time zone,
    updatedate   timestamp with time zone
);

alter table users
    owner to admin;

create table if not exists wallet
(
    id           bigserial
        primary key,
    userid       bigint not null,
    totalmoney   double precision,
    totalpoint   double precision,
    creationdate timestamp with time zone,
    updatedate   timestamp with time zone,
    bankaccount  varchar(255),
    active       integer
);

alter table wallet
    owner to admin;

create table if not exists ward
(
    id           integer not null
        primary key,
    name         varchar(155),
    code         varchar(100),
    districtcode varchar(100),
    providers    jsonb[],
    isactive     boolean,
    createdat    timestamp with time zone,
    updatedat    timestamp with time zone,
    createdby    jsonb,
    creationdate timestamp with time zone,
    updatedate   timestamp with time zone,
    lat          double precision,
    lng          double precision,
    lg           double precision
);

alter table ward
    owner to admin;

create index if not exists idx_ward
    on ward (name);

create function dblink_connect(text) returns text
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function dblink_connect(text) owner to admin;

create function dblink_connect(text, text) returns text
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function dblink_connect(text, text) owner to admin;

create function dblink_connect_u(text) returns text
    strict
    security definer
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function dblink_connect_u(text) owner to admin;

create function dblink_connect_u(text, text) returns text
    strict
    security definer
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function dblink_connect_u(text, text) owner to admin;

create function dblink_disconnect() returns text
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function dblink_disconnect() owner to admin;

create function dblink_disconnect(text) returns text
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function dblink_disconnect(text) owner to admin;

create function dblink_open(text, text) returns text
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function dblink_open(text, text) owner to admin;

create function dblink_open(text, text, boolean) returns text
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function dblink_open(text, text, boolean) owner to admin;

create function dblink_open(text, text, text) returns text
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function dblink_open(text, text, text) owner to admin;

create function dblink_open(text, text, text, boolean) returns text
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function dblink_open(text, text, text, boolean) owner to admin;

create function dblink_fetch(text, integer) returns setof setof record
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;

$$;

alter function dblink_fetch(text, integer) owner to admin;

create function dblink_fetch(text, integer, boolean) returns setof setof record
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;

$$;

alter function dblink_fetch(text, integer, boolean) owner to admin;

create function dblink_fetch(text, text, integer) returns setof setof record
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;

$$;

alter function dblink_fetch(text, text, integer) owner to admin;

create function dblink_fetch(text, text, integer, boolean) returns setof setof record
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;

$$;

alter function dblink_fetch(text, text, integer, boolean) owner to admin;

create function dblink_close(text) returns text
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function dblink_close(text) owner to admin;

create function dblink_close(text, boolean) returns text
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function dblink_close(text, boolean) owner to admin;

create function dblink_close(text, text) returns text
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function dblink_close(text, text) owner to admin;

create function dblink_close(text, text, boolean) returns text
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function dblink_close(text, text, boolean) owner to admin;

create function dblink(text, text) returns setof setof record
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;

$$;

alter function dblink(text, text) owner to admin;

create function dblink(text, text, boolean) returns setof setof record
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;

$$;

alter function dblink(text, text, boolean) owner to admin;

create function dblink(text) returns setof setof record
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;

$$;

alter function dblink(text) owner to admin;

create function dblink(text, boolean) returns setof setof record
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;

$$;

alter function dblink(text, boolean) owner to admin;

create function dblink_exec(text, text) returns text
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function dblink_exec(text, text) owner to admin;

create function dblink_exec(text, text, boolean) returns text
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function dblink_exec(text, text, boolean) owner to admin;

create function dblink_exec(text) returns text
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function dblink_exec(text) owner to admin;

create function dblink_exec(text, boolean) returns text
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function dblink_exec(text, boolean) owner to admin;

create function dblink_get_pkey(text) returns setof setof dblink_pkey_results
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;

$$;

alter function dblink_get_pkey(text) owner to admin;

create function dblink_build_sql_insert(text, int2vector, integer, text[], text[]) returns text
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function dblink_build_sql_insert(text, int2vector, integer, text[], text[]) owner to admin;

create function dblink_build_sql_delete(text, int2vector, integer, text[]) returns text
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function dblink_build_sql_delete(text, int2vector, integer, text[]) owner to admin;

create function dblink_build_sql_update(text, int2vector, integer, text[], text[]) returns text
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function dblink_build_sql_update(text, int2vector, integer, text[], text[]) owner to admin;

create function dblink_current_query() returns text
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function dblink_current_query() owner to admin;

create function dblink_send_query(text, text) returns integer
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function dblink_send_query(text, text) owner to admin;

create function dblink_is_busy(text) returns integer
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function dblink_is_busy(text) owner to admin;

create function dblink_get_result(text) returns setof setof record
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;

$$;

alter function dblink_get_result(text) owner to admin;

create function dblink_get_result(text, boolean) returns setof setof record
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;

$$;

alter function dblink_get_result(text, boolean) owner to admin;

create function dblink_get_connections() returns text[]
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function dblink_get_connections() owner to admin;

create function dblink_cancel_query(text) returns text
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function dblink_cancel_query(text) owner to admin;

create function dblink_error_message(text) returns text
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function dblink_error_message(text) owner to admin;

create function dblink_get_notify(out notify_name text, out be_pid integer, out extra text) returns setof setof record
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;

$$;

alter function dblink_get_notify(out text, out integer, out text) owner to admin;

create function dblink_get_notify(conname text, out notify_name text, out be_pid integer, out extra text) returns setof setof record
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;

$$;

alter function dblink_get_notify(text, out text, out integer, out text) owner to admin;

create function dblink_fdw_validator(options text[], catalog oid) returns void
    strict
    parallel safe
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function dblink_fdw_validator(text[], oid) owner to admin;

create function postgres_fdw_handler() returns fdw_handler
    strict
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function postgres_fdw_handler() owner to admin;

create function postgres_fdw_validator(text[], oid) returns void
    strict
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function postgres_fdw_validator(text[], oid) owner to admin;

create function postgres_fdw_get_connections(out server_name text, out valid boolean) returns setof setof record
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;

$$;

alter function postgres_fdw_get_connections(out text, out boolean) owner to admin;

create function postgres_fdw_disconnect(text) returns boolean
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function postgres_fdw_disconnect(text) owner to admin;

create function postgres_fdw_disconnect_all() returns boolean
    strict
    parallel restricted
    language c
as
$$
begin
-- missing source code
end;
$$;

alter function postgres_fdw_disconnect_all() owner to admin;


