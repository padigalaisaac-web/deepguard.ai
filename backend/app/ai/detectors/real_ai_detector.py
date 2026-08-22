
import numpy as np
from PIL import Image
from functools import lru_cache
from huggingface_hub import hf_hub_download
import onnxruntime as ort


MODEL_REPO = "onnx-community/ai-image-detection-ONNX"
MODEL_FILE = "onnx/model_int8.onnx"


@lru_cache(maxsize=1)
def get_session():
    model_path = hf_hub_download(
        repo_id=MODEL_REPO,
        filename=MODEL_FILE,
    )

    return ort.InferenceSession(
        model_path,
        providers=["CPUExecutionProvider"],
    )


def _softmax(logits):
    logits = logits - np.max(
        logits,
        axis=-1,
        keepdims=True,
    )

    exp_values = np.exp(logits)

    return exp_values / np.sum(
        exp_values,
        axis=-1,
        keepdims=True,
    )

def predict_ai_probability(image: Image.Image):
    try:
        image = image.convert("RGB")
        image = image.resize(
            (224, 224),
            Image.Resampling.BILINEAR
        )

        arr = np.asarray(image).astype(np.float32) / 255.0

        # Model normalization
        arr = (arr - 0.5) / 0.5

        # HWC -> CHW -> batch
        arr = np.transpose(arr, (2, 0, 1))
        arr = np.expand_dims(arr, axis=0).astype(np.float32)

        session = get_session()

        input_name = session.get_inputs()[0].name
        output = session.run(
            None,
            {input_name: arr}
        )[0]

        probabilities = _softmax(output)[0]

        if len(probabilities) < 2:
            raise RuntimeError(
                "AI model returned an unexpected output shape."
            )

        # New model:
        # 0 = REAL
        # 1 = FAKE / AI GENERATED
        ai_probability = float(
            probabilities[1] * 100.0
        )

        return round(
            max(
                0.0,
                min(100.0, ai_probability)
            ),
            2
        )

    except Exception as exc:
        print(f"AI detector error: {exc}")
        return None
