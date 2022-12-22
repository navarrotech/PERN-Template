module.exports = {
    tables: {
        users: {
            id      : { type: 'int', null: false, primaryKey: true },
            name    : { type: 'varchar(45)', default: null },
            email   : { type: 'varchar(60)', default: null, unique: true },
            password: { type: 'varchar(60)', null: false },
            created : { type: 'timestamp', default: 'current_timestamp' },
            updated : { type: 'timestamp', default: 'current_timestamp' }
        }
    },
    security:{
        users: {
            read:  function(request, session, params){
                return {
                    where: {
                        id: session.user.id
                    }
                }
            },
            write: function(request, session, params){
                return {
                    where: {
                        id: session.user.id
                    }
                }
            }
        },
    },
    functions: {
        update_timestamp: `()
            RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated = now(); 
            RETURN NEW;
        END;
            $$ language 'plpgsql';`
    },
    triggers: {
        update_timestamp_users: `BEFORE UPDATE
        ON users FOR EACH ROW EXECUTE PROCEDURE 
        update_timestamp();`
    },
    options: {
        database: '',
        default_timezone: 'MST'
    }
}