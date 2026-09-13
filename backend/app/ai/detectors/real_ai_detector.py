from functools import lru_cache

import numpy as np
import onnxruntime as ort
from huggingface_hub import hf_hub_download
from PIL import Image


MODEL_REPO = "onnx-community/ai-image-detect-distilled-ONNX"
MODEL_FILE = "onnx/model_quantized.onnx"


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


def _softmax(values):
    values = values - np.max(
        values,
        axis=-1,
        keepdims=True,
    )

    exp_values = np.exp(values)

    return exp_values / np.sum(
        exp_values,
        axis=-1,
        keepdims=True,
    )


def predict_ai_probability(image: Image.Image) -> float:
    image = image.convert("RGB")
    image = image.resize(
        (224, 224),
        Image.Resampling.BILINEAR,
    )

    image_array = (
        np.asarray(image)
        .astype(np.float32)
        / 255.0
    )

    image_array = (image_array - 0.5) / 0.5

    image_array = np.transpose(
        image_array,
        (2, 0, 1),
    )

    image_array = np.expand_dims(
        image_array,
        axis=0,
    ).astype(np.float32)

    session = get_session()

    input_name = session.get_inputs()[0].name

    outputs = session.run(
        None,
        {
            input_name: image_array,
        },
    )

    logits = outputs[0]
    probabilities = _softmax(logits)[0]

    if len(probabilities) < 2:
        raise RuntimeError(
            "The AI model did not return two classification scores."
        )

    # Confirmed in the current project code:
    # index 0 = fake
    # index 1 = real
    fake_probability = float(probabilities[0] * 100.0)

    print(
        "AI MODEL OUTPUT:",
        {
            "fake_probability": round(fake_probability, 2),
            "real_probability": round(
                float(probabilities[1] * 100.0),
                2,
            ),
        },
    )

    return round(fake_probability, 2)
