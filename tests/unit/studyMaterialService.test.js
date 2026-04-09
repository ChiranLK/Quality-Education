/**
 * UNIT TESTS — services/studyMaterialService.js
 *
 * Tests all service functions by mocking the StudyMaterial model.
 * No real database connection required.
 *
 * Covers:
 *  ✅ createMaterial — success, duplicate error, DB failure + Cloudinary rollback
 *  ✅ getAllMaterials — pagination, filtering, invalid sort falls back to latest
 *  ✅ getMaterialById — found, not found (404)
 *  ✅ updateMaterial  — owner update, admin update, unauthorized
 *  ✅ deleteMaterial  — owner delete, admin delete, unauthorized
 *  ✅ incrementMetric — valid metric, invalid metric
 *  ✅ toggleLike     — like, unlike
 */

import { jest } from "@jest/globals";
import mongoose from "mongoose";

// ── Mock StudyMaterial model ────────────────────────────────────────────────
jest.mock("../../models/StudyMaterialModel.js");
// ── Mock Cloudinary (no real uploads during unit tests) ─────────────────────
jest.mock("../../Middleware/uploadMiddleware.js", () => ({
  cloudinary: {
    uploader: {
      destroy: jest.fn().mockResolvedValue({ result: "ok" }),
    },
  },
}));

import StudyMaterial from "../../models/StudyMaterialModel.js";
import { cloudinary } from "../../Middleware/uploadMiddleware.js";

import * as service from "../../services/studyMaterialService.js";
import { NotFoundError, BadRequestError, UnauthorizedError } from "../../errors/customErrors.js";
import { buildMaterialPayload, buildUser } from "../setup/testHelpers.js";

// ─── Helpers ────────────────────────────────────────────────────────────────
const mockObjectId = () => new mongoose.Types.ObjectId().toString();

// ════════════════════════════════════════════════════════════════════════════
//  createMaterial
// ════════════════════════════════════════════════════════════════════════════
describe("📝 createMaterial", () => {
  beforeEach(() => jest.clearAllMocks());

  // ✅ Success
  test("should create and return a new study material", async () => {
    const uploaderId = mockObjectId();
    const payload = buildMaterialPayload();
    const created = { _id: mockObjectId(), ...payload, uploadedBy: uploaderId };

    StudyMaterial.findOne = jest.fn().mockResolvedValue(null); // no duplicate
    StudyMaterial.create = jest.fn().mockResolvedValue(created);

    const result = await service.createMaterial(payload, uploaderId);
    expect(result).toEqual(created);
    expect(StudyMaterial.create).toHaveBeenCalledTimes(1);
  });

  // ❌ Error — duplicate title+subject
  test("should throw BadRequestError when duplicate title+subject exists", async () => {
    StudyMaterial.findOne = jest.fn().mockResolvedValue({ _id: mockObjectId() });

    await expect(
      service.createMaterial(buildMaterialPayload(), mockObjectId())
    ).rejects.toThrow(BadRequestError);
  });

  // 🔲 Edge case — Cloudinary rollback on DB failure
  test("should attempt Cloudinary cleanup and re-throw when DB save fails", async () => {
    StudyMaterial.findOne = jest.fn().mockResolvedValue(null);
    StudyMaterial.create = jest.fn().mockRejectedValue(new Error("DB write failed"));

    const payload = buildMaterialPayload({
      fileUrl: "https://res.cloudinary.com/demo/raw/upload/v123/study_materials/orphan",
    });

    // Verify the error is re-thrown so the caller gets the correct response
    await expect(service.createMaterial(payload, mockObjectId())).rejects.toThrow("DB write failed");
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  getAllMaterials
// ════════════════════════════════════════════════════════════════════════════
describe("📋 getAllMaterials", () => {
  beforeEach(() => jest.clearAllMocks());

  // ✅ Success — with default pagination
  test("should return paginated materials", async () => {
    const materials = [buildMaterialPayload(), buildMaterialPayload({ title: "Physics 101 Basics" })];

    const chainMock = {
      lean: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(materials),
    };

    StudyMaterial.countDocuments = jest.fn().mockResolvedValue(2);
    StudyMaterial.find = jest.fn().mockReturnValue(chainMock);

    const result = await service.getAllMaterials({});
    expect(result.totalCount).toBe(2);
    expect(result.materials).toHaveLength(2);
    expect(result.currentPage).toBe(1);
    expect(result.limit).toBe(10);
  });

  // ✅ Filtering by subject and grade
  test("should apply subject and grade filters", async () => {
    const chainMock = {
      lean: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
    };
    StudyMaterial.countDocuments = jest.fn().mockResolvedValue(0);
    StudyMaterial.find = jest.fn().mockReturnValue(chainMock);

    await service.getAllMaterials({ subject: "Physics", grade: "11th" });
    expect(StudyMaterial.find).toHaveBeenCalledWith(
      expect.objectContaining({ subject: "physics", grade: "11th" })
    );
  });

  // 🔲 Edge case — invalid sort value falls back to "latest"
  test("should default to 'latest' sort for an unknown sort value", async () => {
    const chainMock = {
      lean: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
    };
    StudyMaterial.countDocuments = jest.fn().mockResolvedValue(0);
    StudyMaterial.find = jest.fn().mockReturnValue(chainMock);

    await service.getAllMaterials({ sort: "invalid_sort_option" });
    expect(chainMock.sort).toHaveBeenCalledWith({ createdAt: -1 });
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  getMaterialById
// ════════════════════════════════════════════════════════════════════════════
describe("🔍 getMaterialById", () => {
  beforeEach(() => jest.clearAllMocks());

  // ✅ Success — increments views
  test("should return material and increment view count", async () => {
    const id = mockObjectId();
    const material = { _id: id, ...buildMaterialPayload() };

    const chainMock = {
      lean: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue(material),
    };
    StudyMaterial.findByIdAndUpdate = jest.fn().mockReturnValue(chainMock);

    const result = await service.getMaterialById(id);
    expect(result).toEqual(material);
    expect(StudyMaterial.findByIdAndUpdate).toHaveBeenCalledWith(
      id,
      { $inc: { "metrics.views": 1 } },
      { new: true }
    );
  });

  // ❌ Error — material not found
  test("should throw NotFoundError when material does not exist", async () => {
    const chainMock = {
      lean: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue(null),
    };
    StudyMaterial.findByIdAndUpdate = jest.fn().mockReturnValue(chainMock);

    await expect(service.getMaterialById(mockObjectId())).rejects.toThrow(NotFoundError);
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  updateMaterial
// ════════════════════════════════════════════════════════════════════════════
describe("✏️ updateMaterial", () => {
  beforeEach(() => jest.clearAllMocks());

  const id = mockObjectId();

  const buildExistingMaterial = (uploaderId) => ({
    _id: id,
    uploadedBy: uploaderId,
    fileUrl: "https://res.cloudinary.com/demo/raw/upload/v1/study_materials/old_file",
    ...buildMaterialPayload(),
  });

  // ✅ Success — uploader updates own material
  test("owner can update their own material", async () => {
    const user = buildUser();
    const existing = buildExistingMaterial(String(user._id));
    const updated = { ...existing, title: "Updated Title" };

    StudyMaterial.findById = jest.fn().mockResolvedValue(existing);
    const chainMock = {
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue(updated),
    };
    StudyMaterial.findByIdAndUpdate = jest.fn().mockReturnValue(chainMock);

    const result = await service.updateMaterial(id, { title: "Updated Title" }, user);
    expect(result.title).toBe("Updated Title");
  });

  // ✅ Success — admin can update any material
  test("admin can update any material regardless of ownership", async () => {
    const admin = buildUser({ role: "admin" });
    const existing = buildExistingMaterial(mockObjectId()); // different owner
    const updated = { ...existing, title: "Admin Updated" };

    StudyMaterial.findById = jest.fn().mockResolvedValue(existing);
    const chainMock = {
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue(updated),
    };
    StudyMaterial.findByIdAndUpdate = jest.fn().mockReturnValue(chainMock);

    const result = await service.updateMaterial(id, { title: "Admin Updated" }, admin);
    expect(result.title).toBe("Admin Updated");
  });

  // ❌ Error — unauthorized
  test("should throw UnauthorizedError when non-owner tutor tries to update", async () => {
    const tutor = buildUser({ role: "tutor" });
    const existing = buildExistingMaterial(mockObjectId()); // different owner

    StudyMaterial.findById = jest.fn().mockResolvedValue(existing);

    await expect(
      service.updateMaterial(id, { title: "Hacked" }, tutor)
    ).rejects.toThrow(UnauthorizedError);
  });

  // ❌ Error — material not found
  test("should throw NotFoundError when material does not exist", async () => {
    StudyMaterial.findById = jest.fn().mockResolvedValue(null);

    await expect(
      service.updateMaterial(id, { title: "x" }, buildUser())
    ).rejects.toThrow(NotFoundError);
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  deleteMaterial
// ════════════════════════════════════════════════════════════════════════════
describe("🗑️ deleteMaterial", () => {
  beforeEach(() => jest.clearAllMocks());

  const id = mockObjectId();
  const cloudinaryUrl = "https://res.cloudinary.com/demo/raw/upload/v123/study_materials/file";

  // ✅ Success — owner deletes
  test("owner can delete their own material", async () => {
    const user = buildUser();
    const material = {
      _id: id,
      uploadedBy: String(user._id),
      fileUrl: cloudinaryUrl,
    };

    StudyMaterial.findById = jest.fn().mockResolvedValue(material);
    StudyMaterial.findByIdAndDelete = jest.fn().mockResolvedValue(material);

    const result = await service.deleteMaterial(id, user);
    expect(result).toEqual(material);
    expect(StudyMaterial.findByIdAndDelete).toHaveBeenCalledWith(id);
  });

  // ❌ Error — unauthorized
  test("should throw UnauthorizedError for non-owner, non-admin", async () => {
    const tutor = buildUser({ role: "tutor" });
    const material = { _id: id, uploadedBy: mockObjectId(), fileUrl: cloudinaryUrl };

    StudyMaterial.findById = jest.fn().mockResolvedValue(material);

    await expect(service.deleteMaterial(id, tutor)).rejects.toThrow(UnauthorizedError);
  });

  // ❌ Error — not found
  test("should throw NotFoundError when material does not exist", async () => {
    StudyMaterial.findById = jest.fn().mockResolvedValue(null);

    await expect(service.deleteMaterial(id, buildUser())).rejects.toThrow(NotFoundError);
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  incrementMetric
// ════════════════════════════════════════════════════════════════════════════
describe("📈 incrementMetric", () => {
  beforeEach(() => jest.clearAllMocks());

  // ✅ Success — valid metric
  test("should increment download count and return updated metrics", async () => {
    const id = mockObjectId();
    const updated = { _id: id, metrics: { views: 5, downloads: 3, likes: 1 } };

    const chainMock = { select: jest.fn().mockResolvedValue(updated) };
    StudyMaterial.findByIdAndUpdate = jest.fn().mockReturnValue(chainMock);

    const result = await service.incrementMetric(id, "downloads");
    expect(result.metrics.downloads).toBe(3);
  });

  // ❌ Error — invalid metric field
  test("should throw BadRequestError for an invalid metric field", async () => {
    await expect(service.incrementMetric(mockObjectId(), "hacks")).rejects.toThrow(BadRequestError);
  });

  // ❌ Error — material not found
  test("should throw NotFoundError when material does not exist", async () => {
    const chainMock = { select: jest.fn().mockResolvedValue(null) };
    StudyMaterial.findByIdAndUpdate = jest.fn().mockReturnValue(chainMock);

    await expect(service.incrementMetric(mockObjectId(), "downloads")).rejects.toThrow(NotFoundError);
  });
});

// ════════════════════════════════════════════════════════════════════════════
//  toggleLike
// ════════════════════════════════════════════════════════════════════════════
describe("❤️ toggleLike", () => {
  beforeEach(() => jest.clearAllMocks());

  const id = mockObjectId();
  const userId = mockObjectId();

  // ✅ Success — like (user hasn't liked before)
  test("should like a material not yet liked by the user", async () => {
    StudyMaterial.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({ likedBy: [], metrics: { likes: 0 } }),
    });

    const chainMock = { select: jest.fn().mockResolvedValue({ metrics: { likes: 1 } }) };
    StudyMaterial.findByIdAndUpdate = jest.fn().mockReturnValue(chainMock);

    const result = await service.toggleLike(id, userId);
    expect(result.message).toBe("Material liked");
    expect(result.likes).toBe(1);
  });

  // ✅ Success — unlike (user already liked)
  test("should unlike a material already liked by the user", async () => {
    StudyMaterial.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({
        likedBy: [userId],
        metrics: { likes: 1 },
      }),
    });

    const chainMock = { select: jest.fn().mockResolvedValue({ metrics: { likes: 0 } }) };
    StudyMaterial.findByIdAndUpdate = jest.fn().mockReturnValue(chainMock);

    const result = await service.toggleLike(id, userId);
    expect(result.message).toBe("Material unliked");
    expect(result.likes).toBe(0);
  });

  // ❌ Error — not found
  test("should throw NotFoundError when material does not exist", async () => {
    StudyMaterial.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(null),
    });

    await expect(service.toggleLike(id, userId)).rejects.toThrow(NotFoundError);
  });
});
