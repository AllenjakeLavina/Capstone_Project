-- AlterTable
ALTER TABLE `document` ADD COLUMN `clientId` VARCHAR(191) NULL,
    MODIFY `serviceProviderId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
