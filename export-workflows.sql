-- Export aller Workflows als JSON
\copy (SELECT row_to_json(t) FROM workflow_entity t) TO 'workflows-backup.json';

-- Export als CSV
\copy (SELECT * FROM workflow_entity) TO 'workflows-backup.csv' CSV HEADER;

-- Liste aller Workflows
\copy (SELECT id, name, active, created_at, updated_at FROM workflow_entity) TO 'workflow-list.txt';

-- Statistiken
SELECT 
  (SELECT COUNT(*) FROM workflow_entity) as total_workflows,
  (SELECT COUNT(*) FROM workflow_entity WHERE active = true) as active_workflows,
  (SELECT COUNT(*) FROM credentials_entity) as total_credentials;
