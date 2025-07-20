import prisma from "@/lib/prisma";
import { CreatePengajuanRequest } from "@/model/requests/pengajuanRequest";
import { saveFileToLocal } from "./UploadService";
import { sendBotMessage } from "./botService";

export async function savePengajuanService(
  createPengajuanRequest: CreatePengajuanRequest
) {
  try {
    if (createPengajuanRequest.bukti_file !== null) {
      const getPath = await saveFileToLocal(createPengajuanRequest.bukti_file);
      createPengajuanRequest.bukti_url = getPath;
    }

    const pengajuan = await prisma.pengajuan.create({
      data: {
        pegawai_id: createPengajuanRequest.pegawai_id,
        kategori_id: createPengajuanRequest.kategori_id,
        nama_atasan_id: createPengajuanRequest.nama_atasan_id,
        tanggal_mulai: createPengajuanRequest.tanggal_mulai,
        jam_mulai: createPengajuanRequest.jam_mulai,
        tanggal_selesai: createPengajuanRequest.tanggal_selesai,
        jam_selesai: createPengajuanRequest.jam_selesai,
        alasan: createPengajuanRequest.alasan,
        bukti_url: createPengajuanRequest.bukti_url,
        status: "Menunggu",
      },
    });

    if (
      createPengajuanRequest.list_approval &&
      createPengajuanRequest.list_approval.length > 0
    ) {
      const approvals = createPengajuanRequest.list_approval.map(
        (approval, index) => ({
          pengajuan_id: pengajuan.id,
          approver_id: approval.approver_id,
          role: approval.role,
          urutan: approval.urutan,
          status: index === 0 ? "Menunggu" : "Tertunda", // ✅ logika kondisi di sini
          catatan: approval.catatan,
        })
      );

      await prisma.pengajuan_approval.createMany({
        data: approvals,
      });

      // send notification to user who created the pengajuan
      const user = await prisma.user.findUnique({
        where: { id: createPengajuanRequest.pegawai_id },
      });

      const kategori = await prisma.kategori_perizinan.findUnique({
        where: { id: createPengajuanRequest.kategori_id },
      });

      if (user && user.mattermost_id) {
        sendBotMessage(
          user.id,
          `🎉 Pengajuan kamu telah berhasil dibuat dengan ID #${pengajuan.id} - ${kategori?.nama}. Kami akan memprosesnya sesuai alur persetujuan. Terima kasih! 🙌. Untuk detail lebih lanjut dapat dilihat di https://otobos.alfahuma.com/next/pengajuan/status`
        );
      }

      // Send notification to the first approver
      const firstApprover = createPengajuanRequest.list_approval[0];
      if (firstApprover.approver_id) {
        const userApporver = await prisma.user.findUnique({
          where: { id: firstApprover.approver_id },
        });

        if (userApporver && userApporver.mattermost_id) {
          sendBotMessage(
            userApporver.id,
            `✉️ Permohonan baru dari pegawai #${user?.username} kategori #${kategori?.nama} telah masuk dan menanti persetujuan darimu. Mohon ditindaklanjuti ya. 👍. Untuk detail lebih lanjut dapat dilihat di https://otobos.alfahuma.com/next/pengajuan/status`
          );
        }
      }

      return {
        success: true,
        message: "Pengajuan created successfully",
        data: pengajuan,
      };
    }
  } catch (error) {
    console.error("Error creating Pengajuan:", error);
    return {
      success: false,
      message: "Failed to create Pengajuan",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function getAllPengajuanService({
  page = 1,
  perPage = 10,
  status,
  pegawaiId,
  tanggalMulai,
  tanggalSelesai,
  kategoriId,
}: {
  page?: number;
  perPage?: number;
  status?: string;
  pegawaiId?: number;
  tanggalMulai?: Date;
  tanggalSelesai?: Date;
  kategoriId?: number;
}) {
  try {
    const where: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any

    if (status) {
      where.status = status;
    }
    if (pegawaiId) {
      where.pegawai_id = pegawaiId;
    }
    if (tanggalMulai && tanggalSelesai) {
      where.tanggal_mulai = {
        gte: tanggalMulai,
        lte: tanggalSelesai,
      };
    }
    if (kategoriId) {
      where.kategori_id = kategoriId;
    }

    const pengajuan = await prisma.pengajuan.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { id: "desc" },
      include: {
        pengajuan_approval: {
          include: {
            user: true,
          },
        },
        kategori_perizinan: true,
      },
    });

    const totalPengajuan = await prisma.pengajuan.count({ where });

    return {
      success: true,
      data: pengajuan,
      total: totalPengajuan,
      page,
      perPage,
    };
  } catch (error) {
    console.error("Error fetching Pengajuan:", error);
    return {
      success: false,
      message: "Failed to fetch Pengajuan",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function getAllPengajuanApprovalService({
  approverId,
}: {
  approverId?: number;
}) {
  try {
    const where: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
    where.status = "Menunggu";
    if (approverId) {
      where.approver_id = approverId;
    }

    const pengajuan_approval = await prisma.pengajuan_approval.findMany({
      where,
      orderBy: { id: "desc" },
      include: {
        pengajuan: {
          include: {
            user_pengajuan_pegawai_idTouser: true,
            kategori_perizinan: true,
            pengajuan_approval: {
              include: {
                user: true,
              },
            },
          },
        },
        user: true,
      },
    });

    const totalPengajuan = await prisma.pengajuan_approval.count({ where });

    return {
      success: true,
      data: pengajuan_approval,
      total: totalPengajuan,
    };
  } catch (error) {
    console.error("Error fetching Pengajuan:", error);
    return {
      success: false,
      message: "Failed to fetch Pengajuan",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function updateStatusApprovalService(
  pengajuanId: number,
  approverId: number,
  status: "Disetujui" | "Ditolak",
  catatan?: string
) {
  try {
    const pengajuan = await prisma.pengajuan.findUnique({
      where: { id: pengajuanId },
      include: {
        user_pengajuan_pegawai_idTouser: true,
        kategori_perizinan: true,
      },
    });

    const pengajuanApproval = await prisma.pengajuan_approval.findFirst({
      where: {
        pengajuan_id: pengajuanId,
        approver_id: approverId,
      },
    });

    if (!pengajuanApproval) {
      return {
        success: false,
        message: "Pengajuan approval not found",
      };
    }

    const updatedApproval = await prisma.pengajuan_approval.update({
      where: { id: pengajuanApproval.id },
      data: {
        status,
        catatan,
        tanggal_approval: new Date(),
      },
    });

    // jika statusnya ditolak, update status pengajuan menjadi Ditolak
    if (status === "Ditolak") {
      await prisma.pengajuan.update({
        where: { id: pengajuanId },
        data: { status: "Ditolak" },
      });

      // kirim notifikasi ke user yang membuat pengajuan
      if (pengajuan && pengajuan.user_pengajuan_pegawai_idTouser) {
        const user = pengajuan.user_pengajuan_pegawai_idTouser;
        if (user.mattermost_id) {
          sendBotMessage(
            user.id,
            `❌ Pengajuan kamu dengan ID #${pengajuan.id} - ${
              pengajuan.kategori_perizinan?.nama
            } telah ditolak. Catatan: ${
              catatan || "Tidak ada catatan"
            }. Untuk detail lebih lanjut dapat dilihat di https://otobos.alfahuma.com/next/pengajuan/status`
          );
        }
      }
    }

    // jika statusnya disetujui, cek apakah ada approval selanjutnya
    if (
      status === "Disetujui" &&
      pengajuanApproval &&
      pengajuanApproval.urutan !== null
    ) {
      const nextApproval = await prisma.pengajuan_approval.findFirst({
        where: {
          pengajuan_id: pengajuanId,
          status: "Tertunda",
          urutan: pengajuanApproval.urutan + 1,
        },
      });

      if (nextApproval) {
        // update status approval selanjutnya menjadi Menunggu
        await prisma.pengajuan_approval.update({
          where: { id: nextApproval.id },
          data: { status: "Menunggu" },
        });

        // kirim notifikasi ke approver selanjutnya
        const nextApprover = await prisma.user.findUnique({
          where: { id: nextApproval.approver_id },
        });

        if (nextApprover && nextApprover.mattermost_id) {
          sendBotMessage(
            nextApprover.id,
            `✉️ Permohonan baru dari pegawai #${pengajuan?.user_pengajuan_pegawai_idTouser?.username} kategori #${pengajuan?.kategori_perizinan?.nama} telah masuk dan menanti persetujuan darimu. Mohon ditindaklanjuti ya. 👍. Untuk detail lebih lanjut dapat dilihat di https://otobos.alfahuma.com/next/pengajuan/status`
          );
        }
      } else {
        // jika tidak ada approval selanjutnya, update status pengajuan menjadi Disetujui
        await prisma.pengajuan.update({
          where: { id: pengajuanId },
          data: { status: "Disetujui" },
        });
        // kirim notifikasi ke user yang membuat pengajuan
        if (pengajuan && pengajuan.user_pengajuan_pegawai_idTouser) {
          const user = pengajuan.user_pengajuan_pegawai_idTouser;
          if (user.mattermost_id) {
            sendBotMessage(
              user.id,
              `🎉 Pengajuan kamu dengan ID #${pengajuan.id} - ${pengajuan.kategori_perizinan?.nama} telah disetujui. Terima kasih telah menggunakan layanan kami! Untuk detail lebih lanjut dapat dilihat di https://otobos.alfahuma.com/next/pengajuan/status`
            );
          }
        }
      }
    }

    return {
      success: true,
      message: "Pengajuan approval updated successfully",
      data: updatedApproval,
    };
  } catch (error) {
    console.error("Error updating Pengajuan approval:", error);
    return {
      success: false,
      message: "Failed to update Pengajuan approval",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
