import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('stores', (table) => {
    table.string('id', 16).primary().comment('Unique store identifier (e.g., abc12345)');
    table.string('type', 20).notNullable().comment('Store type: woocommerce or medusa');
    table.string('namespace', 64).notNullable().unique().comment('Kubernetes namespace (e.g., store-abc12345)');
    table.string('status', 20).notNullable().comment('Store status: Provisioning, Ready, Failed, Deleting');
    table.string('url', 255).nullable().comment('Store URL (e.g., abc12345.localhost)');
    table.text('error_message').nullable().comment('Error details if status is Failed');
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();

    // Indexes
    table.index('status', 'idx_stores_status');
    table.index('created_at', 'idx_stores_created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('stores');
}
