import Parse from "parse/node.js";

interface LogParams {
  adminId: string;
  adminName: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: any;
}

/**
 * سجل النظام - تسجيل العمليات في كلاس SystemLog في Parse
 */
export async function createSystemLog(params: LogParams) {
  try {
    const SystemLog = Parse.Object.extend("SystemLog");
    const log = new SystemLog();
    
    log.set("adminId", params.adminId);
    log.set("adminName", params.adminName);
    log.set("action", params.action);
    log.set("entityType", params.entityType);
    log.set("entityId", params.entityId);
    log.set("details", params.details);
    
    await log.save(null, { useMasterKey: true });
    console.log(`[Logger] Action logged: ${params.action} by ${params.adminName}`);
  } catch (error) {
    console.error('[Logger] Failed to create system log:', error);
  }
}
