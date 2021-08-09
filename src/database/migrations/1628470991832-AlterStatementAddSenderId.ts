import {MigrationInterface, QueryRunner, TableColumn, TableForeignKey} from "typeorm";

export class AlterStatementAddSenderId1628470991832 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "statements",
            new TableColumn({
                name: "sender_id",
                type: "uuid",
                isNullable: true
            })
        );

        await queryRunner.createForeignKey(
            "statements",
            new TableForeignKey({
                name: "transfer_sender",
                referencedTableName: "users",
                referencedColumnNames: ["id"],
                columnNames: ["sender_id"],
                onUpdate: "CASCADE",
                onDelete: "CASCADE"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey("statements", "transfer_sender");
        await queryRunner.dropColumn("statements", "sender_id");
    }

}
