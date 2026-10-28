import { connectMongoDB } from "@/lib/mongodb";
import { FinanceSetting } from "@/models/FinanceSetting";

export type FinanceSettingsData = {
  registrationFee: number;
  assessmentFee: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  treasurerName: string;
  institutionName: string;
};

export const defaultFinanceSettings: FinanceSettingsData = {
  registrationFee: 250000,
  assessmentFee: 0,
  bankName: "Bank Rakyat Indonesia (BRI)",
  accountNumber: "3419-0106-7835-533",
  accountHolder: "RPL STIMI YAPMI Makassar",
  treasurerName: "Riswan, S.E. (Bendahara RPL)",
  institutionName: "STIMI YAPMI Makassar",
};

export async function getFinanceSettings(): Promise<FinanceSettingsData> {
  await connectMongoDB();
  const setting = await FinanceSetting.findOne().lean();
  if (!setting) {
    return defaultFinanceSettings;
  }
  return {
    registrationFee: setting.registrationFee ?? defaultFinanceSettings.registrationFee,
    assessmentFee: setting.assessmentFee ?? defaultFinanceSettings.assessmentFee,
    bankName: setting.bankName ?? defaultFinanceSettings.bankName,
    accountNumber: setting.accountNumber ?? defaultFinanceSettings.accountNumber,
    accountHolder: setting.accountHolder ?? defaultFinanceSettings.accountHolder,
    treasurerName: setting.treasurerName ?? defaultFinanceSettings.treasurerName,
    institutionName: setting.institutionName ?? defaultFinanceSettings.institutionName,
  };
}

export async function saveFinanceSettings(data: Partial<FinanceSettingsData>): Promise<FinanceSettingsData> {
  await connectMongoDB();
  const updated = await FinanceSetting.findOneAndUpdate(
    {},
    {
      $set: {
        ...data,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  return {
    registrationFee: updated.registrationFee,
    assessmentFee: updated.assessmentFee,
    bankName: updated.bankName,
    accountNumber: updated.accountNumber,
    accountHolder: updated.accountHolder,
    treasurerName: updated.treasurerName,
    institutionName: updated.institutionName,
  };
}
