import { ApplicantProfile } from "@/models/ApplicantProfile";

const STUDY_PROGRAM_CODE = "61201";
const ODD_SEMESTER_SEQUENCE_START = 100;
const EVEN_SEMESTER_SEQUENCE_START = 200;

type PeriodLike = {
  semester?: string | null;
  tahunAkademik?: string | null;
};

export function getRplAcademicYearCode(period?: PeriodLike | null) {
  const academicYear = String(period?.tahunAkademik || "").match(/\d{4}/)?.[0];
  const year = academicYear || String(new Date().getFullYear());
  return year.slice(-2);
}

export function getRplSequenceStart(period?: PeriodLike | null) {
  const semester = String(period?.semester || "").toLowerCase();
  const mentionsOdd = semester.includes("ganjil") || semester.includes("odd");
  const mentionsEven = semester.includes("genap") || semester.includes("even");
  const isEven = (mentionsEven && !mentionsOdd) || semester === "2" || semester === "2.0";
  return isEven ? EVEN_SEMESTER_SEQUENCE_START : ODD_SEMESTER_SEQUENCE_START;
}

export async function generateRplIdentityNumber(period?: PeriodLike | null) {
  const yearCode = getRplAcademicYearCode(period);
  const sequenceStart = getRplSequenceStart(period);
  const prefix = `${yearCode}${STUDY_PROGRAM_CODE}`;
  const sequenceLength = String(sequenceStart).length;

  const latestProfile = await ApplicantProfile.findOne({
    nim: new RegExp(`^${prefix}\\d{${sequenceLength},}$`),
  })
    .sort({ nim: -1 })
    .select("nim")
    .lean();

  const latestSequence = latestProfile?.nim
    ? Number(String(latestProfile.nim).slice(prefix.length))
    : sequenceStart - 1;

  const nextSequence = Math.max(latestSequence + 1, sequenceStart);
  return `${prefix}${nextSequence}`;
}

export function formatRplRegistrationNumber(nim: string) {
  return `RPL-${nim}`;
}
